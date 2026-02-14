// shadcn
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input'; 
// icons
import { Github, FolderGit2, FileUser, Database, Images, FileBraces } from 'lucide-react'
// other
import { useState } from 'react';

export default function Home({}){
    const [serverUrl, setServerURL] = useState('http://' + window.location.host);


    return (
        <div className='flex flex-col justify-center gap-3'>
            <h1 className='text-center text-5xl mt-10'>QzReader</h1>
            <p className='text-center'>连接后端本地bun服务器后，就可以浏览你的QQ空间了</p>
            <div className='flex flex-row justify-center items-center gap-2'>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" asChild><a href='https://github.com/for-the-zero/QzReader' target='_blank'><Github /></a></Button></TooltipTrigger>
                    <TooltipContent>Github(以及后端下载)</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon"><a href='https://github.com/ShunCai/QZoneExport' target='_blank'><FolderGit2 /></a></Button></TooltipTrigger>
                    <TooltipContent>导出助手</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon"><a href='https://ftz.is-a.dev/' target='_blank'><FileUser /></a></Button></TooltipTrigger>
                    <TooltipContent>我的网站</TooltipContent>
                </Tooltip>
            </div>
            <Separator />

            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>连接服务器</CardTitle>
                    <CardDescription>输入服务器URL</CardDescription>
                </CardHeader>
                <CardFooter className='gap-3'>
                    <Input placeholder='http://localhost:3000' value={serverUrl} onChange={(e)=>{setServerURL(e.target.value);}} />
                    <Button>检查</Button>
                </CardFooter>
            </Card>
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>将JSON转换为SQLite</CardTitle>
                    <CardDescription>导入你的json文件以转换为SQLite供该程序使用，如果已转换则跳过</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button className='w-full'><FileBraces />选择文件</Button>
                </CardFooter>
            </Card>
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>选择文件</CardTitle>
                    <CardDescription>选择要查看的文件，其中转换后的SQLite数据库为必填，图片文件夹为选填</CardDescription>
                </CardHeader>
                <CardFooter className='flex flex-row gap-3 justify-around'>
                    <Button className='flex-1'><Database />SQLite文件</Button>
                    <Button className='flex-1'><Images />图片文件夹</Button>
                </CardFooter>
            </Card>
        </div>
    );
};