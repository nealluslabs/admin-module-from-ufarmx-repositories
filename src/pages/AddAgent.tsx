import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HiArrowLeft } from 'react-icons/hi2';
import { agentService } from '@/services/agent.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { ROUTES } from '@/utils/routes';
import toast from 'react-hot-toast';

const formSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
    location: z.string().min(2, 'Location is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddAgent() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            location: '',
        },
    });

    useEffect(() => {
        if (isEditMode && id) {
            loadAgent(id);
        }
    }, [id, isEditMode]);

    const loadAgent = async (agentId: string) => {
        try {
            setLoading(true);
            const agent = await agentService.getAgent(agentId);
            form.reset({
                firstName: agent.firstName,
                lastName: agent.lastName,
                email: agent.email,
                phoneNumber: agent.phoneNumber,
                location: agent.location || '',
            });
        } catch (error) {
            toast.error('Failed to load agent details');
            navigate(ROUTES.AGENTS);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true);
            if (isEditMode && id) {
                await agentService.updateAgent(id, values);
                toast.success('Agent updated successfully');
            } else {
                await agentService.createAgent(values);
                toast.success('Agent created successfully. Credentials sent via email.');
            }
            navigate(ROUTES.AGENTS);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Something went wrong';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.AGENTS)}>
                    <HiArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEditMode ? 'Edit Agent' : 'Create Agent'}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Agent Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="agent@example.com" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 234 567 8900" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City, Region" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[150px]">
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Saving...
                                        </div>
                                    ) : (
                                        isEditMode ? 'Update Agent' : 'Create Agent'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
