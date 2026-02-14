// react
import { useState } from "react";
// shadcn
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent } from "./components/ui/sidebar";
// icon
import { House, Compass, Dice5, ChartBarStacked, Archive } from 'lucide-react';
// pages
import Home from './appComponents/Home';
import Browse from "./appComponents/Browse";
import Random from "./appComponents/Random";
import Analysis from './appComponents/Analysis';
// other
import { AnimatePresence, motion } from "framer-motion";

export default function App({}){
    const [activeTab, setActiveTab] = useState(0);

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="p-2.5 flex items-center gap-2 flex-row justify-center">
                    <Archive className="h-6 w-6" />
                    <h1 className="text-2xl">QzReader</h1>
                </SidebarHeader>
                <SidebarContent className="p-2.5">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 0} onClick={()=>{setActiveTab(0);}}>
                                <House className="h-4 w-4" />
                                首页
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 1} onClick={()=>{setActiveTab(1);}}>
                                <Compass className="h-4 w-4" />
                                浏览
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 2} onClick={()=>{setActiveTab(2);}}>
                                <Dice5 className="h-4 w-4" />
                                抽卡
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 3} onClick={()=>{setActiveTab(3);}}>
                                <ChartBarStacked className="h-4 w-4" />
                                统计
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <main className="p-5 w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={{
                            initial: { opacity: 0, scale: 1.02 },
                            animate: { opacity: 1, scale: 1 },
                            exit: { opacity: 0, scale: 0.98 },
                        }}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.1, ease: [0.3, 0.35, 0, 1.00] }}
                    >
                        {activeTab === 0 && <Home />}
                        {activeTab === 1 && <Browse />}
                        {activeTab === 2 && <Random />}
                        {activeTab === 3 && <Analysis />}
                </motion.div>
            </AnimatePresence>
            </main>
        </SidebarProvider>
    );
};