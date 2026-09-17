---
title: "一加 13 过初阶完美root环境教程"
description: "该方案可过春秋Native check-Eros 4.2 一、Root 方案选择 二、内核编译与刷入 1.编译"
publishedAt: "2026-08-25T18:44:36+08:00"
updatedAt: "2026-08-25T19:27:28+08:00"
slug: "oneplus-13-stealth-root-guide"
tags: ["Android","Root"]
draft: false
seoTitle: "一加 13 过初阶完美root环境教程"
seoDescription: "该方案可过春秋Native check-Eros 4.2 一、Root 方案选择 二、内核编译与刷入 1.编译"
---
###### *该方案可过春秋Native check-Ero**s 4.2***  

## 一、Root 方案选择

1.  **Root 管理器**： [ReSukiSU](https://github.com/ReSukiSU/ReSukiSU)（选择KernelSU 及其分支）
2.  **Root 实现机制**：GKI（Generic Kernel Image，相比 LKM 具有更好的底层兼容性）  
    

## 二、内核编译与刷入

1.编译 AnyKernel3 (AK3) 格式刷机包  
  
参考我的另一篇教程:xxx.(暂时还没写)  
以及我的op13+resukisu+susfs的成品仓库:[仓库地址](https://github.com/yyzmiao/OnePlus_ReSukiSU_SUSFS)

2.刷入后，在 Root 管理器中完成以下设置:

| 设置项 | 状态 |
| --- | --- |
| 隐藏 SELinux 状态 | 开启 |
| 默认卸载模块 | 开启 |

![](/uploads/2026/08/Screenshot_2026-08-25-19-23-45-61_676e4cb4cfb833a96b248618a803cf16-465x1024.jpg)

## 三、模块刷入

### 1\. [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext/releases)

| 设置项 | 状态 |
| --- | --- |
| 排除列表策略 | 仅还原挂载 |
| 使用匿名内存 | 开启 |
| 使用 Zygisk Next 链接器 | 开启 |

![](/uploads/2026/08/Screenshot_2026-08-25-19-25-00-82_676e4cb4cfb833a96b248618a803cf16-465x1024.jpg)

### 2\. [Play Integrity Fix \[INJECT\]](https://github.com/KOWX712/PlayIntegrityFix/releases/)

| 设置项 | 状态 |
| --- | --- |
| Spoof Build | 开启 |
| Spoof Build（Play Store） | 开启 |
| Spoof Props | 开启 |
| Spoof Provider | 开启 |
| Spoof Signature | 开启 |
| Spoof Sdk（Play Store） | 关闭 |

指纹库获取：点击左上角图标获取，来源优先选择 **autopif**。

![](/uploads/2026/08/Screenshot_2026-08-25-19-26-03-67_676e4cb4cfb833a96b248618a803cf16-465x1024.jpg)

### 3\. [TEESimulator](https://github.com/Enginex0/TEESimulator-RS/releases/)

按默认配置安装即可。

### 4\. [LSPosed](https://t.me/LSPosed) + [](https://github.com/dr-tsng/hide-my-applist)**[Hide-My-Applist](https://github.com/Dr-TSNG/Hide-My-Applist)**

1.  安装 **Hide My Applist** 模块
2.  配置模式选择**白名单**
3.  新建一个模板，加入几个正常应用作为伪装
4.  将该模板应用到需要过检测的目标应用上

## 四、SUSFS 设置

| 设置项 | 状态 |
| --- | --- |
| uname | 选择另一槽位 |
| 为非 su 进程隐藏 sus 挂载 | 开启 |
| AVC 日志欺骗 | 开启 |

**隐藏路径**(一般路径)：`/system_ext/app/SoterService`（ 过 TEE 不可信）

![](/uploads/2026/08/image.png)

## 五、推荐模块

| 模块 | 作用 |
| --- | --- |
| [Surfing](https://github.com/eritpchy/FingerprintPay) | 代理 |
| [FingerprintPay](https://github.com/eritpchy/FingerprintPay) | 开启指纹支付 |
| [Hybrid-Mount](https://github.com/Hybrid-Mount/meta-hybrid_mount) | 元模块，提供挂载服务 |
| [TEE\_AutoList](https://t.me/Whitelist520/23810) | 自动更新检测名单 |
| [KsuWebUI](https://github.com/5ec1cff/KsuWebUIStandalone) | 独立 WebUI 应用，无需进入 Root 管理器操作 |
