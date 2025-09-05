import { Footer } from "@/components/layout/footer";
import { Login } from "@/components/layout/Header";
import { ContentCard } from "@/components/layout/content-card";
import { Hero } from "@/components/layout/Hero";
import { generateRecommendCardData, generateNewsCardData } from "@/lib/content-classifier";

// ISR配置导出 - Next.js要求直接导出数值
export const revalidate = 60; // ISR_CONFIG.BLOG_DATA.revalidate
export const dynamic = 'force-static';
export const dynamicParams = true;

export default async function Home() {
  // 异步获取卡片数据
  const [recommendCardData, newsCardData] = await Promise.all([
    generateRecommendCardData(),
    generateNewsCardData()
  ]);

  // 开发环境下添加调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('[Homepage] Data fetched:', {
      recommendCount: recommendCardData.length,
      newsCount: newsCardData.length,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <>
      <article className="flex flex-col items-center justify-center">
        <div className="w-full @container flex flex-col items-center">
          <div className="gap-6 grid grid-cols-1 w-full @lg:max-w-[90rem] @lg:grid-cols-4 px-6">
            <Hero />
            <div className="mb-7 @lg:grid-cols-1 gap-y-4 gap-x-6 cols-pan-1 grid grid-cols-1 @md:grid-cols-3">
              {recommendCardData.map((data, index) => (
                <ContentCard 
                  key={`recommend-${index}`}
                  variant="recommend" 
                  data={data}
                />
              ))}
            </div>
          </div>
          <div className="pt-10 @lg:pt-50 @md:pt-30 px-6 w-full @lg:max-w-[90rem]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">最新消息</h2>
              <button className="text-md text-bold text-[var(--color-text)] hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors ease-curve-sidebar duration-300 p-1 rounded-2xl cursor-pointer">查看更多</button>
            </div>
            <div className="pt-10 grid grid-rows-[repeat(6,120px)] md:grid-rows-[repeat(6,185px)] @lg:grid-rows-[repeat(3,185px)] grid-cols-1 @lg:grid-cols-2 gap-6 w-full">
              {newsCardData.map((data, index) => (
                <ContentCard 
                  key={`news-${index}`}
                  variant="news" 
                  data={data}
                />
              ))}
            </div>
          </div>
          <div className="py-40 px-6 w-full @lg:max-w-[90rem]">
            <div className="py-30 w-full h-full rounded-md bg-gray-100 dark:bg-neutral-800">
              <div className="w-full @md:h-[120px] h-[90px] px-9 grid grid-cols-12 grid-rows-1 ">
                <div className="col-span-10 col-start-2">
                  <div className="w-full h-full flex flex-col gap-5 items-center justify-between">
                    <h2 className="@md:text-5xl text-3xl font-bold text-[var(--color-text)] whitespace-normal @md:block flex flex-col items-center ">
                      <span className="inline-block">准备开始</span>
                      <span className="inline-block">建设云端服务</span>
                    </h2>
                    <Login />
                    <Login isMd={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </article>
    </>
  );
}