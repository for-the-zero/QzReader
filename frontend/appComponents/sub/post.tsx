import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { AvatarGroupCount } from "@/frontend/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { VideoPlayer, VideoPlayerContent, VideoPlayerControlBar, VideoPlayerMuteButton, VideoPlayerPlayButton, VideoPlayerTimeDisplay, VideoPlayerTimeRange, VideoPlayerVolumeRange } from "@/frontend/components/kibo-ui/video-player";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { User, ExternalLink, LockKeyhole, Images } from "lucide-react";
import { motion } from "framer-motion";
import { useGlbState } from "@/frontend/utils/glbState";
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

const Shuoshuo = memo(({ post }: { post: shuoshuoType }) => {
    const [glbState, setGlbState] = useGlbState();
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
                                        <PhotoView key={index} src={`${glbState.serverUrl}/api/img?${new URLSearchParams({src: item.filename})}`}>
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
            {/* TODO:点赞转发位置 */}
            {/* TODO:评论 */}
        </CardContent>
    </Card>;
});
const Shares = memo(({ post }: { post: shareType }) => {
    return <Card></Card>;
    // TODO:
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