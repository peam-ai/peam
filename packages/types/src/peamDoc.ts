export type PeamDoc = {
    id: string;
    url: string;
    title: string;
    content: string;
    metadata?: Record<string, string | number | boolean>;
}
