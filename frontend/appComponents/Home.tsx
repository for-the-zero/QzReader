// shadcn
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input'; 
import { Switch } from "@/components/ui/switch"
import { toast } from 'sonner';
// icons
import { Github, FolderGit2, FileUser, Database, Images, FileBraces } from 'lucide-react'
// other
import { useEffect, useState } from 'react';
import { useGlbState } from '../utils/glbState';

function getFileName(path: string){
    if(path.includes('/')){
        return path.split('/').pop();
    } else if (path.includes('\\')) {
        return path.split('\\').pop();
    } else if (path.includes('>')) {
        return path.split('>').pop();
    } else {
        return path;
    };
};

export default function Home({}){
    const [glbState, setGlbState] = useGlbState();
    const [serverUrl, setServerURL] = useState(glbState.serverUrl);
    const [filePath, setFilePath] = useState<[null | string, null | string]>([null,null]);

    useEffect(()=>{
        if(!glbState.serverUrl){
            setGlbState({...glbState, serverUrl: 'http://' + window.location.host, usable: false, allowOnline: false});
            checkServer();
        };
    }, []);
    const checkUsable = (res: serverConfigType) => { 
        setFilePath([res.dbPath, res.picPath]);
        return res.dbPath ? true : false;
    };
    const checkServer = async() => {
        try{
            let req = await fetch(serverUrl + '/api/ping');
            if(req.status == 200){
                let res: serverConfigType = await req.json();
                setGlbState({...glbState, serverUrl: serverUrl, usable: checkUsable(res)});
                toast.success('可用！已设置为当前连接服务器',{position: "top-center"});
            } else {
                toast.error('失败',{position: "top-center"});
            };
        } catch (error) {
            toast.error('失败',{position: "top-center"});
        };
    };
    const select = async(type: 'db' | 'pic') => {
        try{
            toast.info('正在打开文件选择器...',{position: "top-center"})
            let req = await fetch(serverUrl + `/api/select/${type}`);
            if(req.status == 200){
                let res = await req.json();
                setGlbState({...glbState, usable: checkUsable(res)})
                toast.info(res.msg,{position: "top-center"});
            };
        } catch (error) {
            toast.error('失败或等待超时',{position: "top-center"});
        };
    };
    const openConvert = async() => { 
        try{
            toast.info('正在打开文件选择器...',{position: "top-center"})
            let req = await fetch(serverUrl + `/api/convert`);
            if(req.status == 200){
                let res = await req.json();
                setGlbState({...glbState, usable: checkUsable(res)})
                toast.info(res.msg,{position: "top-center"});
            };
        } catch (error) {
            toast.error('失败或等待超时',{position: "top-center"});
        };
    };

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
                    <Input placeholder={glbState.serverUrl} value={serverUrl} onChange={(e)=>{setServerURL(e.target.value);}} />
                    <Button onClick={checkServer}>检查</Button>
                </CardFooter>
            </Card>
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>将JSON转换为SQLite</CardTitle>
                    <CardDescription>导入你的json文件以转换为SQLite供该程序使用，如果已转换则跳过</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button className='w-full' variant='outline' onClick={openConvert}><FileBraces />选择文件</Button>
                </CardFooter>
            </Card>
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>选择文件</CardTitle>
                    <CardDescription>选择要查看的文件，其中转换后的SQLite数据库为必填，图片文件夹为选填</CardDescription>
                </CardHeader>
                <CardFooter className='flex flex-row gap-3 justify-around'>
                    <Button className='flex-1' onClick={()=>{select('db')}}><Database />SQLite文件{filePath[0] ? `：${getFileName(filePath[0])}` : ''}</Button>
                    <div className='flex-1 flex flex-row items-center gap-2'>
                        <Button className='flex-1' onClick={()=>{select('pic')}} variant='secondary'><Images />图片文件夹{filePath[1] ? `：${getFileName(filePath[1])}` : '（可选）'}</Button>
                        <Tooltip>
                            <TooltipTrigger asChild><div className='flex flex-row gap-2 items-center'>
                                <Switch checked={glbState.allowOnline} onCheckedChange={(checked)=>{setGlbState({...glbState, allowOnline: checked})}} />
                                <p className='select-none' onClick={()=>{setGlbState({...glbState, allowOnline: !glbState.allowOnline})}}>使用在线图片</p>
                            </div></TooltipTrigger>
                            <TooltipContent>本地没有的图片会请求QQ空间服务器，可能会触发风控，也可能有风险</TooltipContent>
                        </Tooltip>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};