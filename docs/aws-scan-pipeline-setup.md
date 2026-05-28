# AWS Scan Pipeline Setup
## SQS → EventBridge Pipes → ECS Fargate (container job)

This document walks through every AWS step needed to wire up the automated scan pipeline.
End state: Cloudflare Worker puts a message on SQS → EventBridge Pipes polls SQS → launches an ECS Fargate task that runs your scanner image → scanner pushes results back to the Worker API.

---

## 1. Prerequisites

- AWS CLI installed and configured (`aws configure`)
- Docker installed locally
- An AWS account with permissions for: ECR, ECS, SQS, IAM, EventBridge Pipes

Set these shell variables once — every command below uses them:

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REPO_CODE=corefix/code-scanner
export ECR_REPO_WEB=corefix/web-scanner
export SQS_QUEUE_NAME=corefix-scan-queue
export ECS_CLUSTER=corefix-scan-cluster
export ECS_TASK_CODE=corefix-code-scan
export ECS_TASK_WEB=corefix-web-scan
export PIPE_NAME_CODE=corefix-code-scan-pipe
export PIPE_NAME_WEB=corefix-web-scan-pipe
```

---

## 2. Create the SQS Queue

```bash
aws sqs create-queue \
  --queue-name "$SQS_QUEUE_NAME" \
  --attributes '{
    "VisibilityTimeout": "900",
    "MessageRetentionPeriod": "86400",
    "ReceiveMessageWaitTimeSeconds": "20"
  }' \
  --region "$AWS_REGION"
```

Get the queue URL and ARN (you'll need both):

```bash
export SQS_QUEUE_URL=$(aws sqs get-queue-url \
  --queue-name "$SQS_QUEUE_NAME" \
  --region "$AWS_REGION" \
  --query QueueUrl --output text)

export SQS_QUEUE_ARN=$(aws sqs get-queue-attributes \
  --queue-url "$SQS_QUEUE_URL" \
  --attribute-names QueueArn \
  --query 'Attributes.QueueArn' --output text)

echo "Queue URL: $SQS_QUEUE_URL"
echo "Queue ARN: $SQS_QUEUE_ARN"
```

**Set these as Cloudflare Worker secrets:**

```bash
cd cf/
echo "$SQS_QUEUE_URL" | npx wrangler secret put SQS_QUEUE_URL --env test
echo "$AWS_REGION"    | npx wrangler secret put AWS_REGION    --env test
# AWS credentials for the Worker to sign SQS requests (step 4)
echo "<key-id>"       | npx wrangler secret put AWS_ACCESS_KEY_ID     --env test
echo "<secret>"       | npx wrangler secret put AWS_SECRET_ACCESS_KEY --env test
# Your Worker's own public URL (scanner uses this to push results back)
echo "https://deeptraq-api-test.cloud-e5c.workers.dev" \
                       | npx wrangler secret put API_BASE_URL --env test
```

---

## 3. Push Scanner Images to ECR

### 3a. Create ECR repositories

```bash
aws ecr create-repository --repository-name "$ECR_REPO_CODE" --region "$AWS_REGION"
aws ecr create-repository --repository-name "$ECR_REPO_WEB"  --region "$AWS_REGION"
```

### 3b. Build and push

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS \
    --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Code scanner
docker build -f Dockerfile.local \
  -t "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_CODE:latest" .
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_CODE:latest"

# Web scanner (uses the ZAP/Nuclei image — adjust Dockerfile name as needed)
docker build -f Dockerfile.zap.local \
  -t "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_WEB:latest" .
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_WEB:latest"
```

Save the image URIs:

```bash
export IMAGE_CODE="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_CODE:latest"
export IMAGE_WEB="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_WEB:latest"
```

---

## 4. IAM Roles

### 4a. IAM user for Cloudflare Worker (SQS send only)

```bash
aws iam create-user --user-name corefix-cf-worker

aws iam put-user-policy \
  --user-name corefix-cf-worker \
  --policy-name SqsSendOnly \
  --policy-document "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Effect\": \"Allow\",
      \"Action\": \"sqs:SendMessage\",
      \"Resource\": \"$SQS_QUEUE_ARN\"
    }]
  }"

# Create access key — paste these into wrangler secrets (step 2)
aws iam create-access-key --user-name corefix-cf-worker
```

### 4b. ECS task execution role (pull image + write logs)

```bash
aws iam create-role \
  --role-name corefix-ecs-execution \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]
  }'

aws iam attach-role-policy \
  --role-name corefix-ecs-execution \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### 4c. EventBridge Pipes role (read SQS + run ECS task)

```bash
aws iam create-role \
  --role-name corefix-pipe-role \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{"Effect":"Allow","Principal":{"Service":"pipes.amazonaws.com"},"Action":"sts:AssumeRole"}]
  }'

aws iam put-role-policy \
  --role-name corefix-pipe-role \
  --policy-name PipePermissions \
  --policy-document "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [
      {
        \"Effect\": \"Allow\",
        \"Action\": [\"sqs:ReceiveMessage\",\"sqs:DeleteMessage\",\"sqs:GetQueueAttributes\"],
        \"Resource\": \"$SQS_QUEUE_ARN\"
      },
      {
        \"Effect\": \"Allow\",
        \"Action\": \"ecs:RunTask\",
        \"Resource\": \"*\"
      },
      {
        \"Effect\": \"Allow\",
        \"Action\": \"iam:PassRole\",
        \"Resource\": [
          \"arn:aws:iam::$AWS_ACCOUNT_ID:role/corefix-ecs-execution\"
        ]
      }
    ]
  }"

export PIPE_ROLE_ARN="arn:aws:iam::$AWS_ACCOUNT_ID:role/corefix-pipe-role"
export ECS_EXEC_ROLE_ARN="arn:aws:iam::$AWS_ACCOUNT_ID:role/corefix-ecs-execution"
```

---

## 5. ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name "$ECS_CLUSTER" \
  --region "$AWS_REGION"

export ECS_CLUSTER_ARN=$(aws ecs describe-clusters \
  --clusters "$ECS_CLUSTER" \
  --query 'clusters[0].clusterArn' --output text)
```

---

## 6. ECS Task Definitions

The key: EventBridge Pipes injects the SQS message body as an environment variable called `SCAN_PAYLOAD` using an input transformer (step 7).

### 6a. Code scanner task

```bash
cat > /tmp/task-code.json <<EOF
{
  "family": "$ECS_TASK_CODE",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "executionRoleArn": "$ECS_EXEC_ROLE_ARN",
  "containerDefinitions": [{
    "name": "code-scanner",
    "image": "$IMAGE_CODE",
    "essential": true,
    "environment": [],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/corefix-code-scan",
        "awslogs-region": "$AWS_REGION",
        "awslogs-stream-prefix": "ecs",
        "awslogs-create-group": "true"
      }
    }
  }]
}
EOF

aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-code.json \
  --region "$AWS_REGION"

export TASK_DEF_CODE_ARN=$(aws ecs describe-task-definition \
  --task-definition "$ECS_TASK_CODE" \
  --query 'taskDefinition.taskDefinitionArn' --output text)
```

### 6b. Web scanner task

```bash
cat > /tmp/task-web.json <<EOF
{
  "family": "$ECS_TASK_WEB",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "executionRoleArn": "$ECS_EXEC_ROLE_ARN",
  "containerDefinitions": [{
    "name": "web-scanner",
    "image": "$IMAGE_WEB",
    "essential": true,
    "environment": [],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/corefix-web-scan",
        "awslogs-region": "$AWS_REGION",
        "awslogs-stream-prefix": "ecs",
        "awslogs-create-group": "true"
      }
    }
  }]
}
EOF

aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-web.json \
  --region "$AWS_REGION"

export TASK_DEF_WEB_ARN=$(aws ecs describe-task-definition \
  --task-definition "$ECS_TASK_WEB" \
  --query 'taskDefinition.taskDefinitionArn' --output text)
```

---

## 7. Networking — VPC / Subnet / Security Group

Fargate tasks need a VPC subnet with internet access (to clone GitHub repos and call the Worker API). Use your default VPC:

```bash
export VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query 'Vpcs[0].VpcId' --output text)

# Pick any public subnet in the default VPC
export SUBNET_ID=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=defaultForAz,Values=true" \
  --query 'Subnets[0].SubnetId' --output text)

# Security group — outbound internet only
export SG_ID=$(aws ec2 create-security-group \
  --group-name corefix-scan-sg \
  --description "Corefix scanner outbound only" \
  --vpc-id "$VPC_ID" \
  --query GroupId --output text)

aws ec2 authorize-security-group-egress \
  --group-id "$SG_ID" \
  --protocol all --cidr 0.0.0.0/0
```

---

## 8. EventBridge Pipes

One pipe per scanner type. The pipe reads from SQS and calls ECS RunTask, injecting the message body as `SCAN_PAYLOAD` via an input transformer.

### Input transformer

EventBridge Pipes pass the SQS message to ECS using a `containerOverrides` target configuration. The message body ends up as the `SCAN_PAYLOAD` environment variable inside the container.

### 8a. Code scanner pipe

```bash
cat > /tmp/pipe-code-target.json <<EOF
{
  "Ecs": {
    "TaskDefinitionArn": "$TASK_DEF_CODE_ARN",
    "TaskCount": 1,
    "LaunchType": "FARGATE",
    "NetworkConfiguration": {
      "AwsvpcConfiguration": {
        "Subnets": ["$SUBNET_ID"],
        "SecurityGroups": ["$SG_ID"],
        "AssignPublicIp": "ENABLED"
      }
    },
    "Overrides": {
      "ContainerOverrides": [{
        "Name": "code-scanner",
        "Environment": [{
          "Name": "SCAN_PAYLOAD",
          "Value": "<$.body>"
        }]
      }]
    }
  }
}
EOF

aws pipes create-pipe \
  --name "$PIPE_NAME_CODE" \
  --role-arn "$PIPE_ROLE_ARN" \
  --source "$SQS_QUEUE_ARN" \
  --source-parameters '{
    "SqsQueueParameters": {
      "BatchSize": 1,
      "MaximumBatchingWindowInSeconds": 0
    },
    "FilterCriteria": {
      "Filters": [{
        "Pattern": "{\"body\": [{\"prefix\": \"{\\\"type\\\":\\\"code\\\"\"}]}}"
      }]
    }
  }' \
  --target "$ECS_CLUSTER_ARN" \
  --target-parameters "$(cat /tmp/pipe-code-target.json)" \
  --region "$AWS_REGION"
```

### 8b. Web scanner pipe

```bash
cat > /tmp/pipe-web-target.json <<EOF
{
  "Ecs": {
    "TaskDefinitionArn": "$TASK_DEF_WEB_ARN",
    "TaskCount": 1,
    "LaunchType": "FARGATE",
    "NetworkConfiguration": {
      "AwsvpcConfiguration": {
        "Subnets": ["$SUBNET_ID"],
        "SecurityGroups": ["$SG_ID"],
        "AssignPublicIp": "ENABLED"
      }
    },
    "Overrides": {
      "ContainerOverrides": [{
        "Name": "web-scanner",
        "Environment": [{
          "Name": "SCAN_PAYLOAD",
          "Value": "<$.body>"
        }]
      }]
    }
  }
}
EOF

aws pipes create-pipe \
  --name "$PIPE_NAME_WEB" \
  --role-arn "$PIPE_ROLE_ARN" \
  --source "$SQS_QUEUE_ARN" \
  --source-parameters '{
    "SqsQueueParameters": {
      "BatchSize": 1,
      "MaximumBatchingWindowInSeconds": 0
    },
    "FilterCriteria": {
      "Filters": [{
        "Pattern": "{\"body\": [{\"prefix\": \"{\\\"type\\\":\\\"web\\\"\"}]}}"
      }]
    }
  }' \
  --target "$ECS_CLUSTER_ARN" \
  --target-parameters "$(cat /tmp/pipe-web-target.json)" \
  --region "$AWS_REGION"
```

> **How filtering works:** Both pipes read the same SQS queue. The filter `"type":"code"` / `"type":"web"` at the start of the JSON body routes each message to the correct container image. Messages that don't match either filter are discarded after the retention period.

---

## 9. Cloudflare Worker secrets (summary)

Run these from inside the `cf/` directory:

```bash
# Already done in step 2 & 4a — listed here for reference
npx wrangler secret put SQS_QUEUE_URL          --env test  # https://sqs.us-east-1.amazonaws.com/...
npx wrangler secret put AWS_REGION             --env test  # us-east-1
npx wrangler secret put AWS_ACCESS_KEY_ID      --env test  # from step 4a
npx wrangler secret put AWS_SECRET_ACCESS_KEY  --env test  # from step 4a
npx wrangler secret put API_BASE_URL           --env test  # https://deeptraq-api-test.cloud-e5c.workers.dev
npx wrangler secret put OPENAI_API_KEY         --env test  # sk-...
npx wrangler secret put DEFAULT_MODEL          --env test  # gpt-4o-mini
```

---

## 10. End-to-end test

### Manual trigger (website UI)

```bash
curl -X POST https://deeptraq-api-test.cloud-e5c.workers.dev/web/projects/scan \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "proj_xxx", "branch": "main"}'
```

Expected response:
```json
{ "success": true, "build_uuid": "...", "message": "Scan queued successfully." }
```

### GitHub webhook trigger

Open a PR or push a commit to a connected repo. In the Cloudflare Worker logs (`npx wrangler tail --env test`) you should see:

```
Push scan queued: repo=my-repo branch=main build=<uuid>
```

### Watch the ECS task run

```bash
# List running tasks
aws ecs list-tasks --cluster "$ECS_CLUSTER" --region "$AWS_REGION"

# Stream logs (once task starts)
aws logs tail /ecs/corefix-code-scan --follow --region "$AWS_REGION"
```

---

## 11. Architecture recap

```
GitHub PR/push
      │
      ▼
Cloudflare Worker (webhook handler)
      │  generates GitHub installation token
      │  fetches/creates SQS API key (encrypted in MongoDB)
      │  builds SCAN_PAYLOAD JSON
      ▼
AWS SQS  ←── also triggered by POST /web/projects/scan (manual)
      │
      ▼
EventBridge Pipes
  ├── filter type=code → ECS Fargate (code-scanner image)
  └── filter type=web  → ECS Fargate (web-scanner image)
            │
            │  SCAN_PAYLOAD env var contains full JSON
            │  code-scanner: git clone + run scanners
            │  web-scanner:  point at target URL + run scanners
            ▼
     POST /api/ingest/raw      → MongoDB findings
     POST /api/enrich          → AI enrichment queue
     POST /api/ingest/enriched → enriched findings
     POST /api/report/create   → HTML report in R2
     POST /api/report/email    → email notification
```

---

## 12. Updating the scanner image

After code changes, push a new image and update the task definition:

```bash
# Rebuild and push
docker build -f Dockerfile.local \
  -t "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_CODE:latest" .
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_CODE:latest"

# Register new task definition revision (same JSON, ECR always pulls :latest)
aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-code.json \
  --region "$AWS_REGION"

# Update the pipe to point at the new revision
NEW_ARN=$(aws ecs describe-task-definition \
  --task-definition "$ECS_TASK_CODE" \
  --query 'taskDefinition.taskDefinitionArn' --output text)

# Re-create target params with new ARN and update pipe
# (edit /tmp/pipe-code-target.json with new TaskDefinitionArn, then:)
aws pipes update-pipe \
  --name "$PIPE_NAME_CODE" \
  --target-parameters "$(cat /tmp/pipe-code-target.json)" \
  --region "$AWS_REGION"
```
