import type { Admin } from '@/services/admin.service';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    HiEllipsisVertical,
    HiOutlinePhone,
    HiOutlineMapPin,
    HiShieldCheck
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface AdminCardProps {
    admin: Admin;
    onDelete: (admin: Admin) => void;
    isDeleting?: boolean;
    currentUserId?: string; // To prevent deleting oneself if needed
}

export function AdminCard({ admin, onDelete, isDeleting }: AdminCardProps) {
    const navigate = useNavigate();

    // Generate avatar URL
    const avatarUrl = `https://ui-avatars.com/api/?name=${admin.firstName}+${admin.lastName}&background=10B981&color=fff&size=128`;

    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
                        <img
                            src={avatarUrl}
                            alt={`${admin.firstName} ${admin.lastName}`}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg leading-none">
                                {admin.firstName} {admin.lastName}
                            </h3>
                            {admin.isSuperAdmin && (
                                <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 px-1.5 py-0 h-5 leading-none rounded uppercase tracking-wider font-bold">
                                    Super Admin
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{admin.email}</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HiEllipsisVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/edit/${admin._id}`)}>
                            Edit Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(admin)}
                        >
                            Delete Admin
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div className="flex items-start gap-2 text-muted-foreground">
                        <HiOutlinePhone className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="break-all">{admin.phoneNumber || 'No phone'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                        <HiOutlineMapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="break-words">{admin.location || 'No location'}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="border-t bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground w-full justify-center">
                    <HiShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>{admin.role || 'Admin'}</span>
                </div>
            </CardFooter>
        </Card>
    );
}
