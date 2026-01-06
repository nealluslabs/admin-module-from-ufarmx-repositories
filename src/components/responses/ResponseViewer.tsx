import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type FormResponse } from '@/services/response.service';

interface ResponseViewerProps {
    response: FormResponse;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
    const fields = response.form?.fields || [];
    const answers = response.responseObject || {};

    if (!fields.length) {
        return <div className="text-muted-foreground p-4">No fields definition found for this form.</div>;
    }

    const renderAnswer = (field: any, answer: any) => {
        if (answer === null || answer === undefined || answer === '') {
            return <span className="text-muted-foreground italic">No answer provided</span>;
        }

        const fieldType = (field.type || field.key || '').toLowerCase();

        switch (fieldType) {
            case 'image':
                return (
                    <div className="mt-2 space-y-2">
                        <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border bg-muted group">
                            <img
                                src={answer}
                                alt={field.prompt || field.label}
                                className="object-cover w-full h-full transition-transform hover:scale-105"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found';
                                }}
                            />
                            <a
                                href={answer}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium"
                            >
                                View Full Size
                            </a>
                        </div>
                    </div>
                );

            case 'gps':
            case 'location':
                // answer is likely "lat,lng" string
                const [lat, lng] = (answer as string).split(',').map(s => s.trim());
                const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
                const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

                return (
                    <div className="mt-2 space-y-2">
                        <div className="aspect-video w-full max-w-2xl rounded-lg overflow-hidden border bg-muted">
                            <iframe
                                title="Location Map"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={mapEmbedUrl}
                                allowFullScreen
                            />
                        </div>
                        <a href={mapLinkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <MapPin className="w-4 h-4" />
                            Open in Google Maps ({lat}, {lng})
                        </a>
                    </div>
                );

            case 'checkbox':
                // answer might be array or string
                if (Array.isArray(answer)) {
                    return <div className="flex flex-wrap gap-2">{answer.map((a, i) => <span key={i} className="bg-secondary px-2 py-1 rounded text-sm">{a}</span>)}</div>
                }
                return <span>{String(answer)}</span>;

            default:
                return <p className="whitespace-pre-wrap">{String(answer)}</p>;
        }
    };

    return (
        <div className="grid gap-6">
            {fields.map((field: any, index: number) => (
                <Card key={index}>
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {index + 1}. {field.prompt || field.label || field.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderAnswer(field, answers[field.name])}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
