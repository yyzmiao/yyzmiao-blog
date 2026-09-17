---
title: "DNS 泄漏与分流配置指南"
description: "本指南梳理了一套兼顾国内直连解析速度与海外防 DNS 泄漏的客户端 DNS 配置方案。 这里使用clash p"
published: 2026-08-16T22:10:01+08:00
updated: 2026-08-25T19:18:29+08:00
tags: ["网络","DNS"]
draft: false
---
本指南梳理了一套兼顾国内直连解析速度与海外防 DNS 泄漏的客户端 DNS 配置方案。 这里使用clash party逐项设置

## 1\. 基础运行模式

| **配置项** | **推荐设定** | **说明** |
| --- | --- | --- |
| **启用 DNS** | **开启** | 启用内置 DNS 模块以接管系统与客户端流量。 |
| **域名映射模式** | **虚假 IP (`fake-ip`)** | 向本地应用即时返回虚拟 IP，实际域名交由代理节点远端解析，彻底杜绝本地 DNS 泄漏。 |
| **回应范围** | `198.18.0.1/16` | Fake-IP 分配的虚拟内网网段，保持默认。 |
| **过滤器模式** | **黑名单** | 黑名单内的域名强制查询真实 IP，其余域名全部走 Fake-IP。 |
| **真实 IP 回应** | `+.lan`  
  
`+.local`  
  
`time.*.com`  
  
`ntp.*.com`  
  
`+.market.xiaomi.com` | 放行局域网发现与 NTP 时间同步服务。  
  
*(注：严禁在此列表中填入通配符 `*`，否则会导致 Fake-IP 完全失效)* |

## 2\. 协议与规则控制

| **配置项** | **推荐设定** | **说明** |
| --- | --- | --- |
| **IPv6** | **关闭** | 关闭 AAAA 记录解析。避免因节点或本地网络 IPv6 策略不一致导致真实 ISP 信息泄漏。 |
| **遵守规则 (`respect-rules`)** | **开启** | 强制 DNS 解析遵循分流规则。命中代理的流量直接走节点，不在本地发起预解析。 |

## 3\. 上游 DNS 服务器配置

### ① DNS 服务器域名解析 (`default-nameserver`)

-   **作用**：引导解析后续 DoH/DoT 服务器的域名（解决域名依赖循环问题），必须为纯 IP 格式。
-   **配置值**：
    -   `tls://223.5.5.5`

### ② 代理服务器域名解析 (`proxy-server-nameserver`)

-   **作用**：专门用于解析订阅节点服务器的域名，确保节点解析走最优国内路由。
-   **配置值**：
    -   `[https://doh.pub/dns-query](https://doh.pub/dns-query)`
    -   `[https://dns.alidns.com/dns-query](https://dns.alidns.com/dns-query)`

### ③ 默认解析服务器 (`nameserver`)

-   **作用**：常规分流的主解析服务器。
-   **配置值**：
    -   `[https://1.1.1.1/dns-query](https://1.1.1.1/dns-query)`
    -   `[https://8.8.8.8/dns-query](https://8.8.8.8/dns-query)`
    -   `[https://doh.pub/dns-query](https://doh.pub/dns-query)`
    -   `[https://dns.alidns.com/dns-query](https://dns.alidns.com/dns-query)`*(建议仅保留海外加密 DNS，国内域名交由下方 direct-nameserver 处理，避免并发查询造成泄漏)*

### ④ 直连解析服务器 (`direct-nameserver`)

-   **作用**：专门解析命中 `DIRECT`（直连/国内白名单）规则的域名，保障国内 CDN 调度准确度。
-   **配置值**：
    -   `[https://doh.pub/dns-query](https://doh.pub/dns-query)`
    -   `[https://dns.alidns.com/dns-query](https://dns.alidns.com/dns-query)`

## 4\. 系统与 Hosts 设置

| **配置项** | **推荐设定** | **说明** |
| --- | --- | --- |
| **覆盖 DNS 策略** | **关闭** | 防止订阅规则中的默认 DNS 覆盖当前自定义的安全配置。 |
| **使用系统 Hosts** | **关闭** | 不读取操作系统 hosts 文件。 |
| **自定义 Hosts** | **关闭** | 无特定静态解析或屏蔽需求时保持关闭。 |
| **回退服务器 (`fallback`)** | **留空** | 在 Fake-IP 配合规则分流模式下，无需额外指定 fallback。 |

## 5\. 回退过滤设置 (`fallback-filter`)

| **配置项** | **推荐设定** | **说明** |
| --- | --- | --- |
| **GeoIP 过滤** | **开启** | 根据 nameserver 解析返回的 IP 地理位置决定是否触发回退。 |
| **GeoIP 国家代码** | `CN` | 返回非 CN IP 时判定为海外流量，触发防护机制。 |
| **回退 IP CIDR** | `240.0.0.0/4`  
  
`0.0.0.0/32` | 丢弃常见的 DNS 污染/保留网段。 |
| **回退域名** | `+.google.com`  
  
`+.facebook.com`  
  
`+.youtube.com` | 强制触发回退防护的域名白名单。 |

## 6\. YAML 核心配置参考

YAML

```
dns:
  enable: true
  ipv6: false
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter-mode: blacklist
  fake-ip-filter:
    - '+.lan'
    - '+.local'
    - 'time.*.com'
    - 'ntp.*.com'
    - '+.market.xiaomi.com'
  respect-rules: true
  default-nameserver:
    - 'tls://223.5.5.5'
  proxy-server-nameserver:
    - 'https://doh.pub/dns-query'
    - 'https://dns.alidns.com/dns-query'
  nameserver:
    - 'https://1.1.1.1/dns-query'
    - 'https://8.8.8.8/dns-query'
  direct-nameserver:
    - 'https://doh.pub/dns-query'
    - 'https://dns.alidns.com/dns-query'
  fallback-filter:
    geoip: true
    geoip-code: CN
    ipcidr:
      - 240.0.0.0/4
      - 0.0.0.0/32
    domain:
      - '+.google.com'
      - '+.facebook.com'
      - '+.youtube.com'
```

## 7\. 验证与排查

1.  **浏览器设置**：进入浏览器设置，关闭「使用安全 DNS / DoH」，交由客户端接管。
2.  **清理本地缓存**：
    -   Windows：`ipconfig /flushdns`
    -   macOS：`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
3.  **泄漏检测**：访问 [BrowserLeaks DNS Leak Test](https://browserleaks.com/dns)，测试结果中不应包含任何国内运营商（如 China Mobile / China Telecom / Alibaba）的 DNS 节点。
