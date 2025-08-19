import { Footer } from "@/components/layout/footer";
import { Login } from "@/components/layout/Header";
import { TextAnimate } from "@/components/magicui/text-animate";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ContentCard } from "@/components/layout/content-card";
import { generateRecommendCardData, generateNewsCardData } from "@/lib/content-classifier";

export default async function Home() {
  // 异步获取卡片数据
  const [recommendCardData, newsCardData] = await Promise.all([
    generateRecommendCardData(),
    generateNewsCardData()
  ]);

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


const Hero = () => {
  return(
    <div className="group relative md:aspect-[16/9] aspect-[3/4] rounded-lg @lg:col-span-3 @lg:sticky top-0 @lg:mb-0 @md:mb-20 mb-5 mt-10 cursor-pointer">
      <div className="relative h-full w-full rounded-2xl grid grid-rows-[auto_1fr_auto] bg-[var(--color-card)] overflow-hidden">
        <div className="absolute w-full h-full transformCard">
          <AuroraBackground className="group-hover:scale-110 transition-all duration-300">
            <span className="@md:text-[5rem] text-5xl font-thin text-[var(--color-text)] whitespace-nowrap flex-nowrap">
              <TextAnimate animation="blurInUp" by="character" once>
                NEXT网站重构
              </TextAnimate>
            </span>
          </AuroraBackground>
        </div>
      </div>
      <div className="mt-6">
        <h1 className="@md:text-5xl text-4xl font-bold ">
            2025年暑期更新
        </h1>
        <div className="text-sm font-bold @md:mt-3 mt-2">
            生产最积极，诞生项目最多的暑假。
        </div>
      </div>
    </div>
)}