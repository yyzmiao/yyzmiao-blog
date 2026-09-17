/**
 * 博客分类目录。一级分类保持少而稳定，二级分类负责具体归档。
 * 即使某个分类暂时没有文章，也会显示在分类总览中。
 */
export const categoryConfig = [
	{
		name: "技术",
		subcategories: ["网络与安全", "系统与运维", "开发与编程", "移动设备", "AI 与自动化"],
	},
	{
		name: "项目",
		subcategories: ["自研项目", "开源改造"],
	},
	{
		name: "资源",
		subcategories: ["软件工具", "配置模板", "资料整理"],
	},
	{
		name: "随笔",
		subcategories: ["站点记录", "日常想法"],
	},
] as const;
