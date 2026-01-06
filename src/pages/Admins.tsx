import { useEffect, useState } from 'react';
import { adminService, type Admin } from '@/services/admin.service';
import { AdminCard } from '@/components/admins/AdminCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HiPlus, HiMagnifyingGlass, HiOutlineUserGroup } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Admins() {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Delete state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAdmins();
            setAdmins(data);
        } catch (error) {
            toast.error('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (admin: Admin) => {
        setAdminToDelete(admin);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!adminToDelete) return;

        try {
            setIsDeleting(true);
            // Use user_id for deletion as per backend requirement
            const userId = adminToDelete.user_id || adminToDelete.userId;

            if (!userId) {
                toast.error('Cannot delete admin: User ID missing');
                return;
            }

            await adminService.deleteAdminUser(userId);
            toast.success('Admin deleted successfully');

            // Remove from local state
            setAdmins(prev => prev.filter(a => a._id !== adminToDelete._id));
            setDeleteModalOpen(false);
            setAdminToDelete(null);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete admin';
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredAdmins = admins.filter(admin => {
        const query = searchQuery.toLowerCase();
        return (
            admin.firstName.toLowerCase().includes(query) ||
            admin.lastName.toLowerCase().includes(query) ||
            admin.email?.toLowerCase().includes(query) ||
            admin.location?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admins</h1>
                    <p className="text-muted-foreground">
                        Manage system administrators and their permissions.
                    </p>
                </div>
                <Button onClick={() => navigate('/admin/create')} className="w-full sm:w-auto">
                    <HiPlus className="mr-2 h-4 w-4" />
                    Create Admin
                </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <HiMagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search admins..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Admins Grid */}
            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-[250px] rounded-xl border bg-card text-card-foreground shadow animate-pulse bg-muted/20" />
                    ))}
                </div>
            ) : filteredAdmins.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <HiOutlineUserGroup className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="mt-6 text-xl font-semibold">No admins found</h2>
                    <p className="mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm">
                        {searchQuery ? "No admins match your search query." : "Get started by creating a new administrator."}
                    </p>
                    {!searchQuery && (
                        <Button onClick={() => navigate('/admin/create')} className="mt-6">
                            <HiPlus className="mr-2 h-4 w-4" />
                            Create Admin
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAdmins.map((admin) => (
                        <AdminCard
                            key={admin._id}
                            admin={admin}
                            onDelete={handleDeleteClick}
                            isDeleting={isDeleting && adminToDelete?._id === admin._id}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteModalOpen} onOpenChange={(open) => !isDeleting && setDeleteModalOpen(open)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Admin</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">{adminToDelete?.firstName} {adminToDelete?.lastName}</span>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete Admin"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
