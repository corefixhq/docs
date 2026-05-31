---
hide_title: true
sidebar_label: Nmap
---

## Tool Information

| Field                  | Details                                                      |
| ---------------------- | ------------------------------------------------------------ |
| Tool                   | Nmap (Network Mapper)                                        |
| Category               | Network Discovery & Security Auditing                        |
| License                | Nmap Public Source License (NPSL)                            |
| Source Code            | [https://github.com/nmap/nmap](https://github.com/nmap/nmap) |
| Official Documentation | [https://nmap.org/docs.html](https://nmap.org/docs.html)     |
| Website                | [https://nmap.org](https://nmap.org)                         |

Nmap is an open-source network scanning tool used to discover hosts, identify open ports, detect services, and analyze network exposure. It is widely used in security auditing and penetration testing.

---

## Dashboards Using This Tool

| Dashboard               |
| ----------------------- |
| Network Perimeter       |
| Cloud Workload Scanning |

---

## Scanners Available

### Port Scan & Discovery Scan

Identifies **open, closed, or filtered ports** on devices to expose potential entry points for attackers by examining services such as HTTP, SSH, FTP, or databases.

This scan helps security teams understand which services are externally accessible and may require hardening.

---

### Advanced Network Scan

Maps the network to identify exposed services and devices, detecting:

* Unpatched services
* Exposed network services
* Network misconfigurations
* Weak or outdated services

The scan performs **deeper service enumeration across TCP and UDP ports**.

---

## Scanner Options

| Option                           | Description                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Scan Top TCP Ports               | Scans the top **1000 TCP ports (IANA assigned ports)** to identify exposed services |
| Aggressive Vulnerability Scripts | Runs vulnerability detection scripts aggressively during **Advanced Network Scan**  |



