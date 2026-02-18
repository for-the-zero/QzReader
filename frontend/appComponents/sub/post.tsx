import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { AvatarGroupCount } from "@/frontend/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { VideoPlayer, VideoPlayerContent, VideoPlayerControlBar, VideoPlayerMuteButton, VideoPlayerPlayButton, VideoPlayerTimeDisplay, VideoPlayerTimeRange, VideoPlayerVolumeRange } from "@/frontend/components/kibo-ui/video-player";
import {QRCodeSVG} from 'qrcode.react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { User, ExternalLink, LockKeyhole, Images, Heart, Forward, MapPin, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useGlbState } from "@/frontend/utils/glbState";
import { useIsMobile } from "@/hooks/use-mobile";
import { memo } from "react";

function textFormatter(text: string) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    const decodedText = textarea.value;
    const parts = decodedText.split(/(<\/?(?:a|img)\b[^>]*>)/g);
    let stack: { tag: string; content: string }[] = [];
    let result: React.ReactNode[] = [];
    let buffer = '';
    for (const part of parts) {
        if (/^<\/a>/i.test(part)) {
            if (stack.length > 0 && stack[stack.length - 1]?.tag === 'a') {
                const item = stack.pop()!;
                const temp = document.createElement('div');
                temp.innerHTML = `<a${item.content}>`;
                const el = temp.firstElementChild;
                if (el?.tagName === 'A') {
                    const href = el.getAttribute('href');
                    if (href) {
                        result.push(
                            <Tooltip key={result.length}>
                                <TooltipTrigger>
                                    <a href={href} target="_blank" className="hover:underline underline-offset-4 text-muted-foreground">
                                        {buffer}
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>{href}</TooltipContent>
                            </Tooltip>
                        );
                        buffer = '';
                        continue;
                    };
                };
            };
            buffer += part;
        } else if (/^<a\s/i.test(part)) {
            if (buffer) result.push(buffer);
            buffer = '';
            stack.push({ tag: 'a', content: part.slice(2, -1) });
        } else if (/^<img\s/i.test(part)) {
            if (buffer) result.push(buffer);
            buffer = '';
            const temp = document.createElement('div');
            temp.innerHTML = part;
            const el = temp.firstElementChild;
            if (el?.tagName === 'IMG') {
                const src = el.getAttribute('src');
                const alt = el.getAttribute('alt') || '';
                if (src) {
                    result.push(<img key={result.length} src={src} alt={alt} className="inline-block" loading="lazy" />);
                    continue;
                };
            };
            result.push(part);
        } else {
            buffer += part;
        };
    };
    if (buffer) result.push(buffer);
    return result;
};

const Comments = ({ items }: { items: postComment[] }) => {
    return <div className="overflow-y-auto flex flex-col gap-2 w-full">
        {items.map((item) => (
            <div className="flex flex-col">
                <div>
                    <Tooltip>
                        <TooltipTrigger className="text-muted-foreground">{item.name}</TooltipTrigger>
                        <TooltipContent>
                            QQ号：{item.uin}<br />
                            发送时间：{new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(item.create_time * 1000)}
                        </TooltipContent>
                    </Tooltip>
                    ：<span>{textFormatter(item.content)}</span>
                </div>
                {item.replies.length > 0 ? <div className="border-l-16 border-l-gray-900 pl-2">
                    <Comments items={item.replies} />
                </div> : null}
            </div>
        ))}
    </div>;
};

const Shuoshuo = memo(({ post }: { post: shuoshuoType }) => {
    const [glbState] = useGlbState();
    return <Card className="gap-0">
        <CardHeader>
            <CardTitle><div className="flex flex-row items-center gap-2">
                <AvatarGroupCount><User /></AvatarGroupCount>
                <div className="flex flex-col gap-1 items-start">
                    <Tooltip><TooltipTrigger>{post.nickname}</TooltipTrigger>
                    <TooltipContent>{post.uin}</TooltipContent></Tooltip>
                    <p className="text-xs font-light text-muted-foreground items-center">
                        {new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(post.created_time * 1000)}
                        {post.last_modify ? ` · 最后编辑于 ${new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(post.last_modify * 1000)}` : ''}
                        {post.source_name ? ` · 来自 ${post.source_name}` : ''}
                        {post.secret ? [' · ',<LockKeyhole className="inline-block size-2.75 translate-y-[-2.25px]" />] : ''}
                    </p>
                </div>
            </div></CardTitle>
            <CardAction><Button variant="ghost" size='icon' asChild><a href={post.uni_key} target="_blank"><ExternalLink /></a></Button></CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
            <p className="whitespace-pre-wrap">{
                post.conlist.map((con) => [
                    <Tooltip>
                        <TooltipTrigger>
                            <a href={con.custom_url} target="_blank" className="hover:underline underline-offset-4 text-muted-foreground">@{con.nick}</a>
                        </TooltipTrigger>
                        <TooltipContent>{con.uin}</TooltipContent>
                    </Tooltip>,
                    <Tooltip>
                        <TooltipTrigger>
                            <a href={con.url} target="_blank" className="hover:underline underline-offset-4 text-muted-foreground">{con.text}</a>
                        </TooltipTrigger>
                        <TooltipContent>{con.url}</TooltipContent>
                    </Tooltip>,
                    <span>{con.custom_display ? textFormatter(con.custom_display): ''}</span>,
                ][con.type])
            }</p>
            {post.video_total >= 1 || post.image_total >= 1 
                ? <Card className="p-0"><CardContent className="p-0">
                    <Collapsible>
                        <CollapsibleTrigger asChild><Button variant="ghost" className="group w-full">
                            <Images />{post.video_total >= 1 ? '视频' : ''}{post.image_total >= 1 && post.video_total >= 1 ? '和' : ''}{post.image_total >= 1 ? '图片' : ''}
                        </Button></CollapsibleTrigger>
                        <CollapsibleContent>
                            {post.video_total >= 1 ? <div className="flex flex-col gap-2">
                                {post.video.map((item, index) => <VideoPlayer className="w-full">
                                    <VideoPlayerContent
                                    className=" max-h-[75vh]"
                                        crossOrigin="" muted preload="auto" slot="media"
                                        src={`${glbState.serverUrl}/api/img?${new URLSearchParams({src: item.filename, })}`}
                                    />
                                    <VideoPlayerControlBar>
                                        <VideoPlayerPlayButton />
                                        <VideoPlayerTimeRange />
                                        <VideoPlayerTimeDisplay showDuration />
                                        <VideoPlayerMuteButton />
                                        <VideoPlayerVolumeRange />
                                    </VideoPlayerControlBar>
                                </VideoPlayer>)}
                            </div> : null}
                            {post.image_total >= 1 ? <PhotoProvider>
                                <div className="grid grid-cols-3 gap-2">
                                    {post.images.map((item, index) => (
                                        <PhotoView key={index} src={`${glbState.serverUrl}/api/img?${new URLSearchParams({src: item.filename, ...(glbState.allowOnline && {online: item.url})})}`}>
                                            <img className="object-cover w-full h-full max-h-[50vh] aspect-square" src={`${glbState.serverUrl}/api/img?${new URLSearchParams({src: item.filename, ...(glbState.allowOnline && {online: item.url})})}`} />
                                        </PhotoView>
                                    ))}
                                </div>
                            </PhotoProvider> : null}
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent></Card> 
                : null
            }
            <div className="flex flex-row justify-between items-center">
                <p className="text-sm font-light text-muted-foreground items-center">
                    {post.like_total >= 1
                        ? <HoverCard openDelay={0} closeDelay={0}>
                            <HoverCardTrigger>
                                <Heart className="inline-block size-4 translate-y-[-2.25px]" /> {post.like_total}
                            </HoverCardTrigger>
                            <HoverCardContent>
                                {post.likes.map((item, index) => [
                                    <Tooltip> 
                                        <TooltipTrigger>
                                            <span className="text-sm">{item.nick}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>{item.fuin}</TooltipContent>
                                    </Tooltip>,
                                <br />])}
                            </HoverCardContent>
                        </HoverCard>
                    : null}
                    {(post.like_total >= 1 && post.fwd_num >= 1) || (post.like_total >= 1 && post.lbs.name) ? ' · ' : null}
                    {post.fwd_num >= 1
                        ? [<Forward className="inline-block size-4 translate-y-[-2.25px]" />, ' ', post.fwd_num]
                    : null}
                    {post.fwd_num >= 1 && post.lbs.name ? ' · ' : null}
                    {post.lbs.name
                        ? <Tooltip>
                            <TooltipTrigger>
                                <MapPin className="inline-block size-4 translate-y-[-2.25px]" /> {post.lbs.name}
                            </TooltipTrigger>
                            <TooltipContent>经度 {post.lbs.pos_x}<br />纬度 {post.lbs.pos_y}</TooltipContent>
                        </Tooltip>
                    : null}
                </p>
                <Drawer direction={useIsMobile() ? 'bottom' : 'right'}>
                    <DrawerTrigger>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant='ghost' size='icon-xs' disabled={post.comment_total == 0}><MessageSquare /></Button>
                            </TooltipTrigger>
                            <TooltipContent>{post.comment_total >= 1 ? `评论 (${post.comment_total})` : '无评论'}</TooltipContent>
                        </Tooltip>
                    </DrawerTrigger>
                    <DrawerContent className="p-4">
                        <DrawerHeader className="p-1 mb-3"><DrawerTitle className="text-2xl">评论</DrawerTitle></DrawerHeader>
                        <Comments items={post.comments} />
                    </DrawerContent>
                </Drawer>
            </div>
        </CardContent>
    </Card>;
});
const Shares = memo(({ post }: { post: shareType }) => {
    const [glbState] = useGlbState();
    return <Card className="gap-0">
        <CardHeader>
            <CardTitle><div className="flex flex-row items-center gap-2">
                <AvatarGroupCount><User /></AvatarGroupCount>
                <div className="flex flex-col gap-1 items-start">
                    <Tooltip><TooltipTrigger>{post.nickname}</TooltipTrigger>
                    <TooltipContent>{post.uin}</TooltipContent></Tooltip>
                    <p className="text-xs font-light text-muted-foreground items-center">
                        {new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(post.created_time * 1000)}
                        {' · '}
                        来自{post.share_source.from.name}
                    </p>
                </div>
            </div></CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
            <p className="whitespace-pre-wrap">{post.content}</p>
            <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger>
                    <Item variant="outline" asChild>
                        <a target="_blank" href={post.share_source.url.replace(/^.*?(mqqapi:\/\/)/, '$1')}>
                            {post.images[0]
                                ? <ItemMedia>
                                    <PhotoProvider> 
                                        <PhotoView src={`${glbState.serverUrl}/api/img?${new URLSearchParams({src: post.images[0].filename, ...(glbState.allowOnline && {online: post.images[0].url})})}`}>
                                            <img className="w-full max-w-30" src={`${glbState.serverUrl}/api/img?${new URLSearchParams({src: post.images[0].filename, ...(glbState.allowOnline && {online: post.images[0].url})})}`} />
                                        </PhotoView>
                                    </PhotoProvider>
                                </ItemMedia>
                            : null}
                            <ItemContent>
                                <ItemTitle className="line-clamp-1">{post.share_source.title}</ItemTitle>
                                <ItemDescription>{post.share_source.desc}</ItemDescription>
                            </ItemContent>
                        </a>
                    </Item>
                </HoverCardTrigger>
                <HoverCardContent side="left" className="flex flex-col p-3 gap-3 text-sm justify-center items-center"> 
                    <p>也可以用手机扫描二维码</p>
                    <QRCodeSVG bgColor="var(--popover)" fgColor="var(--foreground)" value={post.share_source.url.replace(/^.*?(mqqapi:\/\/)/, '$1')} />
                </HoverCardContent>
            </HoverCard>
            <div className="flex flex-row justify-between items-center">
                <p className="text-sm font-light text-muted-foreground items-center">
                    {post.like_total >= 1
                        ? <HoverCard openDelay={0} closeDelay={0}>
                            <HoverCardTrigger>
                                <Heart className="inline-block size-4 translate-y-[-2.25px]" /> {post.like_total}
                            </HoverCardTrigger>
                            <HoverCardContent>
                                {post.likes.map((item, index) => [
                                    <Tooltip> 
                                        <TooltipTrigger>
                                            <span className="text-sm">{item.nick}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>{item.fuin}</TooltipContent>
                                    </Tooltip>,
                                <br />])}
                            </HoverCardContent>
                        </HoverCard>
                    : null}
                </p>
                <Drawer direction={useIsMobile() ? 'bottom' : 'right'}>
                    <DrawerTrigger>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant='ghost' size='icon-xs' disabled={post.comment_total == 0}><MessageSquare /></Button>
                            </TooltipTrigger>
                            <TooltipContent>{post.comment_total >= 1 ? `评论 (${post.comment_total})` : '无评论'}</TooltipContent>
                        </Tooltip>
                    </DrawerTrigger>
                    <DrawerContent className="p-4">
                        <DrawerHeader className="p-1 mb-3"><DrawerTitle className="text-2xl">评论</DrawerTitle></DrawerHeader>
                        <Comments items={post.comments} />
                    </DrawerContent>
                </Drawer>
            </div>
        </CardContent>
    </Card>;
});

export default function Post({ post }: { post: postType }) {
    return (
        <motion.div
            key={post.tid}
            variants={{
                initial: { opacity: 0, scale: 0.98 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 1.02 },
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.3, 0.35, 0, 1.00] }}
        >
            {post.type === "shuoshuo" ? <Shuoshuo post={post} /> : <Shares post={post} />}
        </motion.div>
    );
};