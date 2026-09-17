---
title: "Gemini in Chrome 启用与故障排查：按钮存在却打不开怎么办"
description: "从 chrome://glic/internals 入手，系统排查 Gemini in Chrome 的账号、语言、地区和启动参数问题，并提供 Windows 临时启动与安全回滚方法。"
published: 2026-09-14T15:34:50+08:00
updated: 2026-09-17T21:55:00+08:00
category: "技术"
subcategory: "AI 与自动化"
tags: ["Gemini", "Chrome", "Windows", "故障排查"]
draft: false
---

Gemini in Chrome 的入口有时已经出现在浏览器顶部，但点击后没有任何反应。遇到这种情况，不要反复修改 Chrome 配置文件：先打开内部诊断页，确认失败的是账号、语言、地区还是服务器资格，再决定如何处理。

本文记录一套在 Windows 上验证过的排查流程，重点解决以下情况：

- “问问 Gemini”按钮存在，但点击无反应；
- 网络出口位于受支持地区，Chrome 仍判断为其他国家；
- 带参数的快捷方式看似正确，实际参数没有作用；
- 手动修改 `Local State` 后短暂生效，重启又恢复原状。

> Gemini in Chrome 仍在分批开放。下面的启动参数属于 Chromium 的测试和诊断手段，不能替代 Google 账号资格或服务器授权，也不保证在未来版本中继续有效。

## 一、先确认官方使用条件

根据 Google 的说明，Gemini in Chrome 需要同时满足以下条件：

- 使用最新版 Chrome；
- 使用 Windows、macOS 或 Chromebook Plus；
- 登录符合条件的 Google 账号，且不是无痕窗口；
- 设备语言和所在地区受到支持；
- 工作或学校账号可能还需要管理员开放权限；
- 功能已分批开放到当前账号。

支持范围会发生变化，应以 [Google 官方支持页面](https://support.google.com/chrome/answer/16283624?hl=zh-Hans) 为准。

先完成这些基础检查，再进入下面的内部诊断。否则，即使本地按钮出现，侧边面板也未必能够使用。

## 二、用内部页面定位真正的失败项

在出现问题的 Chrome 窗口中打开：

```text
chrome://glic/internals
```

注意，正确地址是 `chrome://glic/internals`，不是 `chrome://glic-internals`。

重点检查以下项目：

| 检查项 | 含义 |
| --- | --- |
| `Enabled by Chrome Flags` | Gemini in Chrome 相关功能是否被 Chrome 功能开关启用 |
| `Regular profile` | 当前是否为普通用户配置，而非无痕或不受支持的配置 |
| `Pref or flag based rollout applies` | 当前版本是否命中功能 rollout |
| `Account exists and has the Gemini in Chrome capability` | Google 账号是否具备该功能资格 |
| `Account exists and is fully signed-in` | Chrome 是否完整登录账号 |
| `Server side allows this feature` | 服务器是否允许该账号使用 |
| `Passed locale filter` | 当前语言是否通过检查 |
| `Passed country filter` | 当前国家或地区是否通过检查 |
| `Permanent Country Code` | Chrome 保存的长期国家代码 |
| `Session Country Code` | 当前会话获得的国家代码 |

### 一个典型的地区不匹配案例

本次排查中，账号、登录、语言、rollout 和服务器许可均正常，唯一失败项是：

```text
Passed country filter: false
Permanent Country Code: cn
Session Country Code: cn
```

这说明问题不在按钮本身，而是 Chrome 仍把当前会话识别为 `cn`，因此国家过滤没有通过。Chromium 的实现确实会把账号能力、策略、地区和语言作为独立条件计算；按钮可见也不等于所有启用条件都已经满足。

## 三、为什么代理出口正确，地区检查仍可能失败

Chrome 的地区判断并不只看当前公网 IP。Variations 服务还可能使用已经保存的长期国家代码、最近一次会话国家以及服务器下发状态。

所以可能出现这种组合：

- IPv4、IPv6 都来自受支持地区；
- DNS 和 WebRTC 没有明显泄漏；
- `gemini.google.com` 可以访问；
- 但 `chrome://glic/internals` 仍显示旧国家代码。

网络检查只能证明当前出口情况，不能证明 Chrome 的 Variations 国家已经刷新。更换网络后，也可能需要完整重启 Chrome 或等待后续版本重新计算。

## 四、优先使用官方排障方法

建议先按以下顺序处理：

1. 更新 Chrome 到最新版。
2. 确认 Chrome 已完整登录目标 Google 账号。
3. 确认不是无痕窗口，也不是临时或受限 Profile。
4. 检查设备语言是否受支持。
5. 完全退出并重新打开 Chrome。
6. 如果身处受支持地区，暂时关闭 VPN 后复测。
7. 在 `chrome://flags` 中恢复默认设置，再重启浏览器。
8. 工作或学校账号需确认管理员没有禁用该功能。
9. 右键 Gemini 面板并选择重新加载。

完成后再次查看 `chrome://glic/internals`。如果仍然只有 `Passed country filter` 失败，再考虑下面的临时诊断方案。

## 五、用启动参数进行临时验证

Chromium 提供了 `--variations-override-country` 参数，用于测试 Variations 在不同国家条件下的行为。针对地区过滤问题，可以临时使用：

```text
--variations-override-country=us
--disable-features=GlicCountryFiltering
```

两个参数的作用分别是：

- `--variations-override-country=us`：本次运行将 Variations 使用的国家覆盖为美国；该设置不会跨会话永久保存。
- `--disable-features=GlicCountryFiltering`：本次运行禁用 Gemini in Chrome 的客户端国家过滤功能。

它们只适合验证“是否确实卡在地区过滤”，不会给账号增加服务器资格，也不会解决管理员策略、账号能力或 rollout 未开放的问题。

### Windows PowerShell 启动脚本

可以新建 `launch-chrome-gemini-us.ps1`，写入：

```powershell
$chromeCandidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromePath = $chromeCandidates |
    Where-Object { Test-Path -LiteralPath $_ } |
    Select-Object -First 1

if (-not $chromePath) {
    throw "没有找到 Chrome，请检查安装路径。"
}

# 启动参数只会在新的 Chrome 主进程上生效
Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue

for ($i = 0; $i -lt 20 -and (Get-Process chrome -ErrorAction SilentlyContinue); $i++) {
    Start-Sleep -Milliseconds 250
}

Start-Process -FilePath $chromePath -ArgumentList @(
    "--variations-override-country=us",
    "--disable-features=GlicCountryFiltering"
)
```

运行前务必保存网页表单、在线文档和正在进行的下载。脚本会强制结束全部 Chrome 进程；普通标签页通常可以恢复，但未提交的页面内容、隐身窗口和进行中的任务可能丢失。

如果 PowerShell 阻止本次脚本运行，可以在普通 PowerShell 窗口中使用：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\launch-chrome-gemini-us.ps1"
```

这只为本次进程绕过脚本执行限制，不会永久修改系统执行策略。

## 六、为什么普通快捷方式经常“没有生效”

Chrome 采用单一主进程模型。Windows 登录后，Chrome 自动启动项可能已经创建了后台主进程，例如：

```text
chrome.exe --no-startup-window --restart --restore-last-session
```

此时再双击带参数的快捷方式，通常只是让现有主进程打开一个新窗口，新的启动参数不会重新应用。因此会出现：

- 快捷方式目标看起来完全正确；
- 新窗口也正常打开；
- 但 Gemini 的国家状态没有变化。

这也是脚本先关闭所有 Chrome 进程、等待退出完成，再重新启动的原因。

## 七、确认启动参数是否真正生效

打开：

```text
chrome://version
```

在“命令行”一项中确认包含：

```text
--variations-override-country=us
--disable-features=GlicCountryFiltering
```

如果没有，说明当前 Chrome 主进程不是由该脚本启动，或者启动时已有其他 Chrome 进程接管。

随后重新打开：

```text
chrome://glic/internals
```

检查 `Passed country filter`、账号资格、完整登录状态和服务器许可。若这些项目全部通过但面板仍无反应，可依次尝试：

1. 测试 `https://gemini.google.com/` 是否可访问；
2. 暂时关闭扩展后复测；
3. 右键 Gemini 面板并重新加载；
4. 更新到下一版 Chrome 后重新测试；
5. 更换为个人 Google 账号，排除组织策略影响。

## 八、不建议直接修改 Chrome 配置文件

一些第三方脚本会编辑 Chrome 用户目录中的 `Local State` 或 `Preferences`，例如写入：

```text
variations_country = us
variations_permanent_consistency_country = [..., us]
intl.app_locale = en-US
is_glic_eligible = true
```

这种方式存在三个问题：

1. Chrome 联网后会根据账号和服务器状态重新计算资格，本地字段可能被覆盖；
2. Chrome 运行时修改 JSON 文件，可能造成写入冲突或配置损坏；
3. `is_glic_eligible = true` 不能替代真实的服务器资格检查。

因此，排障时优先读取 `chrome://glic/internals`，需要验证地区因素时使用一次性启动参数。不要把直接编辑用户配置作为日常开启方式。

## 九、恢复与撤销

### 停止使用临时参数

完全退出 Chrome，然后从普通快捷方式重新启动即可。上述参数只影响通过诊断脚本启动的那次 Chrome 会话。

### 删除启动器

删除自己创建的 `.ps1` 和快捷方式即可，不会删除 Chrome、浏览记录或 Google 账号。

### 恢复配置备份

如果此前使用第三方脚本修改过 `Local State` 或 `Preferences`，恢复前应先备份当前配置，并确保 Chrome 已完全退出。旧备份会覆盖后来新增的设置，不应作为常规修复方法。

## 十、快速判断表

| 现象 | 优先检查 |
| --- | --- |
| 完全没有 Gemini 入口 | Chrome 版本、rollout、账号资格、设备语言 |
| 按钮存在但打不开 | `chrome://glic/internals` 中的地区、账号和服务器状态 |
| `Passed country filter` 失败 | Permanent/Session Country Code、实际所在地区、VPN 和完整重启 |
| 参数写在快捷方式里却无效 | `chrome://version`，以及启动前是否已有 Chrome 主进程 |
| 修改 `is_glic_eligible` 后又失效 | 账号能力或服务器状态重新计算，不要继续强改本地 JSON |
| 所有检查均通过但面板空白 | 重新加载面板、禁用扩展、更新 Chrome、检查组织策略 |

## 参考资料

- [Google Chrome 帮助：使用 Chrome 中的 Gemini](https://support.google.com/chrome/answer/16283624?hl=zh-Hans)
- [Google Chrome 帮助：Chrome 中的 Gemini 支持范围](https://support.google.com/chrome/answer/17140089?hl=zh-Hans)
- [Chromium：Variations 国家覆盖参数](https://chromium.googlesource.com/chromium/src/+/main/components/variations/variations_switches.cc)
- [Chromium：Gemini in Chrome 启用条件实现](https://chromium.googlesource.com/chromium/src/+/main/chrome/browser/glic/public/glic_enabling.cc)
- [Chromium：创建 `chrome://glic/internals` 的变更记录](https://chromium.googlesource.com/chromium/src/+/854c23b412aaccb4172d27dc727b5d2891fd02be)
