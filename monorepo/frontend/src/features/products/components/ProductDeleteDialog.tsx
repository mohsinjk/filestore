import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface ProductDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: string;
    productName: string;
}

export const ProductDeleteDialog = ({
    open,
    onOpenChange,
    productId,
    productName,
}: ProductDeleteDialogProps) => {
    const navigate = useNavigate();
    const { mutate: deleteProduct, isPending, isSuccess } = useDeleteProduct();

    useEffect(() => {
        if (isSuccess) {
            onOpenChange(false);
            navigate('/products');
        }
    }, [isSuccess, navigate, onOpenChange]);

    const handleDelete = () => {
        deleteProduct(productId);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{productName}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
