import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ContentCard, type ContentCardData } from '@/components/layout/content-card';
import { contactLinksData } from '@/config/content-data';
import { generateProjectCardData } from '@/lib/content-classifier';
import { TextAnimate } from '@/components/magicui/text-animate';

// ISR配置 - 启用增量静态再生
export const revalidate = 3600; // 1小时重新验证

export const metadata: Metadata = {
  title: '关于我',
  description: '个人介绍页面 - 专注于创造简洁优雅的解决方案',
  keywords: ['开发者', 'Next.js', 'React', 'TypeScript', '全栈开发', 'UI/UX'],
};
 
export default async function MePage() {
  // 异步获取项目卡片数据，带错误处理
  let projectCardData: ContentCardData[];
  try {
    projectCardData = await generateProjectCardData();
    // 为每个项目数据添加最后更新时间
    projectCardData = projectCardData.map(project => ({
      ...project,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to load project data:', error);
    // 降级处理：返回空数组
    projectCardData = [];
  }
  return (
    <div className="min-h-full bg-white dark:bg-black text-black dark:text-white">
      {/* 主容器 - 响应式布局 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* 头部区域 - 响应式标题 */}
        <header className="mb-12 sm:mb-16 lg:mb-20">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-12 space-y-8 lg:space-y-0">
            {/* 头像区域 */}
            <div className="flex-shrink-0 lg:pt-2">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
                <Image
                  src="/header.png"
                  alt="Shizurak Avatar"
                  fill
                  className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  priority
                />
              </div>
            </div>
            
            {/* 文字内容区域 */}
            <div className="flex-1 space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-tight">
                <TextAnimate animation="blurInUp" by="character" once>
                  Hello, I&apos;m
                </TextAnimate>
                <span className="block text-gray-600 dark:text-gray-300 mt-2">
                  <TextAnimate animation="blurInUp" by="character" delay={0.2} once>
                    Shizurak
                  </TextAnimate>
                </span>
              </h1>
              <div className="w-12 sm:w-16 lg:w-20 h-px bg-black dark:bg-white"></div>
              <div className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed">
                <TextAnimate animation="slideLeft" by="character" once>
                  专注于创造简洁、优雅的数字解决方案，追求代码的纯粹与功能的完美平衡
                </TextAnimate>
              </div>
            </div>
          </div>
        </header>

        {/* 主要内容区域 - 响应式网格 */}
        <main className="space-y-16 sm:space-y-20 lg:space-y-24">
          
          {/* 关于我 & 专长 - 双栏布局 */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {/* 关于我 */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  关于我
                </h2>
                <div className="space-y-4 text-gray-800 dark:text-gray-200">
                  <p className="text-base sm:text-lg leading-relaxed">
                      我是一名全栈开发者，热衷于构建用户体验优秀的现代化应用程序。
                      拥有丰富的前端和后端开发经验，专注于性能优化和代码质量。
                  </p>
                  <p className="text-base sm:text-lg leading-relaxed">
                      相信技术应该服务于人，致力于通过代码创造有意义的产品，
                      让复杂的问题变得简单，让用户的生活变得更美好。
                  </p>
                </div>
              </div>

              {/* 工作经验 */}
              <div>
                <h3 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  经验
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-200">高级前端开发工程师</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">2025 - 至今</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-200">全栈开发工程师</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">2022 - 2024</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-200">前端开发工程师</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">2020 - 2022</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 技能专长 */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  技术栈
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">前端</h4>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <div>React / Next.js</div>
                      <div>TypeScript / JavaScript</div>
                      <div>Tailwind CSS</div>
                      <div>Three.js / WebGL</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">后端</h4>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <div>Node.js / Express</div>
                      <div>Python / FastAPI</div>
                      <div>PostgreSQL / MongoDB</div>
                      <div>Docker / AWS</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 设计工具 */}
              <div>
                <h3 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  设计工具
                </h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div>Figma / Sketch</div>
                  <div>Adobe Creative Suite</div>
                  <div>Blender / Cinema 4D</div>
                </div>
              </div>
            </div>
          </section>

          {/* 项目展示 */}
          <section>
            <h2 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">
              精选项目
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {projectCardData.length > 0 ? (
                projectCardData.map((project, index) => (
                  <ContentCard
                    key={`project-${project.id || index}`}
                    data={project}
                    variant="project"
                    enableISR={true}
                    cacheKey={`/api/content-cards/project/${project.id || index}`}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>暂无项目数据</p>
                </div>
              )}
            </div>
          </section>

          {/* 联系方式 & 理念 */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {/* 联系方式 */}
            <div>
              <h2 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">
                联系方式
              </h2>
              <div className="space-y-4">
                {contactLinksData.map((link, index) => {
                  const LinkComponent = link.external ? 'a' : Link;
                  const linkProps = link.external 
                    ? { 
                        href: link.href,
                        target: "_blank",
                        rel: "noopener noreferrer"
                      }
                    : { href: link.href };
                  
                  return (
                    <LinkComponent
                      key={index}
                      {...linkProps}
                      className="group flex items-center space-x-3 text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors duration-200"
                    >
                      {link.icon && (
                        <span className="text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                          {link.icon}
                        </span>
                      )}
                      <span className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full group-hover:bg-black dark:group-hover:bg-white transition-colors duration-200"></span>
                      <span className="border-b border-transparent group-hover:border-black dark:group-hover:border-white transition-colors duration-200 pb-0.5">
                        {link.name}
                      </span>
                    </LinkComponent>
                  );
                })}
              </div>
            </div>

            {/* 设计理念 */}
            <div>
              <h2 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">
                设计理念
              </h2>
              <div className="space-y-6">
                <blockquote className="text-base sm:text-lg italic text-gray-700 dark:text-gray-300 border-l-2 border-black dark:border-white pl-4 sm:pl-6">
                  &ldquo;简单是复杂的终极形式&rdquo;
                  <cite className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 not-italic uppercase tracking-wider">
                    — Leonardo da Vinci
                  </cite>
                </blockquote>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  我相信最好的设计是不被注意到的设计。
                  通过减法而非加法，通过留白而非填充，
                  创造出既美观又实用的产品体验。
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* 底部装饰 */}
        <footer className="mt-16 sm:mt-20 lg:mt-24 pt-8 sm:pt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              © 2024 XRAK. 保留所有权利。
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-black dark:bg-white rounded-full"></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}