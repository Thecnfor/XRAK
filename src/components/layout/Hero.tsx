'use client'

import { TextAnimate } from "@/components/magicui/text-animate";
import PixelBlast from "@/components/ui/PixelBlast";
import Dither from "@/components/ui/Dither";
import { useTheme } from "@/hooks/useTheme";

/**
 * Hero组件 - 首页顶部的大型展示区域
 * 根据主题动态显示不同的动画效果
 */
export const Hero = () => {
  const isDarkMode = useTheme();
  
  return (
    <div className="group relative md:aspect-[16/9] aspect-[3/4] rounded-lg @lg:col-span-3 @lg:sticky top-10 @lg:mb-0 @md:mb-20 mb-5 mt-0 @lg:mt-10 cursor-pointer">
      <div className="relative h-full w-full rounded-2xl grid grid-rows-[auto_1fr_auto] overflow-hidden">
        <div className="absolute w-full h-full transformCard">
          <div
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            {isDarkMode ? (
              <PixelBlast
                variant="circle"
                pixelSize={6}
                color="#70e2eb"
                patternScale={3}
                patternDensity={1.2}
                pixelSizeJitter={0.5}
                enableRipples
                rippleSpeed={0.4}
                rippleThickness={0.12}
                rippleIntensityScale={1.5}
                speed={0.6}
                edgeFade={0.25}
                transparent
              />
            ) : (
              <Dither
                waveColor={[0.5, 0.5, 0.5]}
                disableAnimation={false}
                enableMouseInteraction={true}
                mouseRadius={0.3}
                colorNum={4}
                waveAmplitude={0.3}
                waveFrequency={3}
                waveSpeed={0.05}
              />
            )}
            <div className="absolute h-full w-full top-0 flex items-center justify-center">
              <span className="@md:text-[5rem] text-5xl font-thin text-white bg:text-[var(--color-text)] whitespace-nowrap flex-nowrap">
                <TextAnimate animation="blurInUp" by="character" once>
                  RAK网站生态
                </TextAnimate>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h1 className="@md:text-5xl text-4xl font-bold ">2025年开学更新</h1>
        <div className="text-sm font-bold @md:mt-3 mt-2">
          生产最积极，诞生项目最多的暑假。
        </div>
      </div>
    </div>
  );
};

//NEXT网站重构---2025年暑期更新（2025年7月1日-2025年9月1日）
//RAK网站生态---2025年开学更新（2025年1月1日-2025年11月1日）
