import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HiArrowLeft } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService } from '@/services/admin.service';

const adminFormSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
    location: z.string().min(2, 'Location is required'),
    isSuperAdmin: z.boolean().default(false).optional(),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export default function AddAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [fetchingAdmin, setFetchingAdmin] = useState(false);

    const isEditMode = !!id;

    const form = useForm<AdminFormValues>({
        resolver: zodResolver(adminFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            location: '',
            isSuperAdmin: false,
        },
    });

    useEffect(() => {
        if (isEditMode && id) {
            fetchAdminDetails(id);
        }
    }, [isEditMode, id]);

    const fetchAdminDetails = async (adminId: string) => {
        try {
            setFetchingAdmin(true);
            const admin = await adminService.getAdmin(adminId);

            form.reset({
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email || '',
                phoneNumber: admin.phoneNumber || '',
                location: admin.location || '',
                isSuperAdmin: admin.isSuperAdmin,
            });

            // Disable email editing in edit mode if desired (usually safer for identity)
            // But API allows update if implemented. Let's allow it but note that backend handles checks.
        } catch (error) {
            toast.error('Failed to fetch admin details');
            navigate('/admins');
        } finally {
            setFetchingAdmin(false);
        }
    };

    const onSubmit = async (values: AdminFormValues) => {
        try {
            setIsLoading(true);

            if (isEditMode && id) {
                await adminService.updateAdmin(id, {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    phoneNumber: values.phoneNumber,
                    location: values.location,
                    // Role usually not updated here unless backend supports it directly in update
                });
                toast.success('Admin updated successfully');
            } else {
                if (values.isSuperAdmin) {
                    await adminService.createSuperAdmin(values);
                    toast.success('Super Admin created successfully');
                } else {
                    await adminService.createAdmin(values);
                    toast.success('Admin created successfully');
                }
            }
            navigate('/admins');
        } catch (error: any) {
            const message = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} admin`;
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (fetchingAdmin) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admins')}>
                    <HiArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditMode ? 'Edit Admin' : 'Create Admin'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditMode ? 'Update admin details and permissions.' : 'Add a new administrator to the system.'}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Admin Details</CardTitle>
                    <CardDescription>
                        Enter the personal information for the administrator.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
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
                                            <Input placeholder="john.doe@example.com" type="email" {...field} disabled={isEditMode} />
                                        </FormControl>
                                        <FormDescription>
                                            {isEditMode ? 'Email cannot be changed.' : 'This will be used for login and notifications.'}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1234567890" {...field} />
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
                                            <Input placeholder="City, Country" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!isEditMode && (
                                <>
                                    <Separator />
                                    <FormField
                                        control={form.control}
                                        name="isSuperAdmin"
                                        render={({ field }: { field: any }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Super Admin Privileges
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Detailed access to all system resources and settings.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                                    {isLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
                                    {isEditMode ? 'Update Admin' : 'Create Admin'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
