import { useState, useCallback } from "react";
import { useGlbState } from "../utils/glbState";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Post from "./sub/post";

export default function Random({}) {
    const [glbState] = useGlbState();
    const [randList, setRandList] = useState<postType[]>([]);
    const [loading, setLoading] = useState(false);
    const fetchRandom = useCallback(async (count: number) => {
        if (!glbState.serverUrl || !glbState.usable) {
            toast.error('请先连接服务器', { position: 'top-center' });
            return;
        }
        setLoading(true);
        try {
            const reqBody: reqListType = {
                filter: glbState.filter,
                range: [0, 0],
            };
            const req = await fetch(glbState.serverUrl + '/api/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody),
            });
            if (!req.ok) throw new Error('请求失败');
            const res = await req.json();
            const total = res.total || 0;
            if (total === 0) {
                toast.error('没有符合条件的帖子', { position: 'top-center' });
                setLoading(false);
                return;
            }
            const limit = Math.min(count, total);
            const offsets: number[] = [];
            const used = new Set<number>();
            while (offsets.length < limit) {
                const rand = Math.floor(Math.random() * total);
                if (!used.has(rand)) {
                    used.add(rand);
                    offsets.push(rand);
                }
            }
            const posts: postType[] = [];
            for (const offset of offsets) {
                const subReq = await fetch(glbState.serverUrl + '/api/get', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filter: glbState.filter, range: [offset, offset] }),
                });
                if (subReq.ok) {
                    const subRes = await subReq.json();
                    if (subRes.list?.[0]) posts.push(subRes.list[0]);
                }
            }
            setRandList(posts);
        } catch (e) {
            console.error(e);
            toast.error('加载失败', { position: 'top-center' });
        } finally {
            setLoading(false);
        }
    }, [glbState.serverUrl, glbState.usable, glbState.filter]);
    const reset = () => setRandList([]);
    if (randList.length === 0) {
        return (
            <div className="flex flex-col h-[75vh] w-[75%] mx-auto gap-4">
                <Button
                    variant="outline"
                    className="flex-1 w-full text-3xl flex flex-col gap-4"
                    onClick={() => fetchRandom(1)}
                    disabled={loading || !glbState.usable}
                >
                    {loading ? <Loader2 className="size-10 animate-spin" /> : <Sparkles className="size-10" />}
                    单抽出奇迹！
                </Button>
                <Button
                    className="flex-1 w-full text-3xl flex flex-col gap-4"
                    onClick={() => fetchRandom(10)}
                    disabled={loading || !glbState.usable}
                >
                    {loading ? <Loader2 className="size-10 animate-spin" /> : <Sparkles className="size-10" />}
                    来发十连！
                </Button>
            </div>
        );
    }
    return (
        <div className="flex flex-col justify-center gap-3">
            <div className="flex items-center justify-center py-4">
                <Button variant="outline" onClick={reset}>
                    <ArrowLeft />
                    再来一次
                </Button>
            </div>
            <div className="flex flex-col gap-4 w-[80%] m-auto">
                {randList.map((post) => <Post post={post} />)}
            </div>
        </div>
    );
};