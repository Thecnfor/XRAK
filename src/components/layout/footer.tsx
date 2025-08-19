import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="@container relative w-full border-t border-black/10 dark:border-white/10 bg-white dark:bg-black">
            {/* Background watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-6xl font-light text-black/5 dark:text-white/5 select-none">
                    XRAK
                </span>
            </div>
            
            {/* Content */}
            <div className="relative px-6 py-8 mx-auto max-w-7xl">
                <div className="flex flex-col space-y-4">
                    {/* Copyright */}
                    <div className="text-xs text-black/60 dark:text-white/60">
                        © 2025 XRAK
                    </div>
                    
                    {/* Legal links */}
                    <div className="flex flex-col space-y-2 text-xs">
                        <div className="flex items-center space-x-2">
                            <Image 
                                src="/police.png" 
                                alt="公安备案" 
                                width={12} 
                                height={10} 
                                className="opacity-60"
                            />
                            <Link 
                                href="https://beian.mps.gov.cn/#/query/webSearch?code=44200102445584" 
                                target="_blank"
                                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors duration-200"
                            >
                                粤公网安备44200102445584号
                            </Link>
                        </div>
                        
                        <Link 
                            href="https://beian.miit.gov.cn/#/Integrated/index" 
                            target="_blank"
                            className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors duration-200 w-fit"
                        >
                            湘ICP备2025127679号-1
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}