'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductForm from '@/components/ProductForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import SearchInput from '@/components/SearchInput';
import { useApp } from '@/context/AppContext';
import { createProduct, updateProduct, deleteProduct, createMovement } from '@/lib/api';
import { formatHUF } from '@/lib/utils-erp';
import { Product } from '@/lib/types';

interface MovementForm {
  productId: string;
  type: 'in' | 'out';
  quantity: string;
  note: string;
}

export default function InventoryPage() {
  const { state, refreshProducts, refreshInventory } = useApp();
  const { products, loading } = state;
  const isLoading = loading.products;

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [movOpen, setMovOpen] = useState(false);
  const [movForm, setMovForm] = useState<MovementForm>({ productId: '', type: 'in', quantity: '', note: '' });
  const [movSaving, setMovSaving] = useState(false);

  useEffect(() => {
    refreshProducts();
    refreshInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: Omit<Product, 'id'>) => {
    await createProduct(data);
    await refreshProducts();
    toast.success('Termék létrehozva');
  };

  const handleUpdate = async (data: Omit<Product, 'id'>) => {
    if (!editing) return;
    await updateProduct(editing.id, data);
    await refreshProducts();
    toast.success('Termék frissítve');
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      await refreshProducts();
      toast.success('Termék törölve');
    } catch {
      toast.error('Hiba a törlés során');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openMov = (product: Product, type: 'in' | 'out') => {
    setMovForm({ productId: product.id, type, quantity: '', note: '' });
    setMovOpen(true);
  };

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movForm.quantity || Number(movForm.quantity) <= 0) {
      toast.error('Érvényes mennyiséget adjon meg');
      return;
    }
    setMovSaving(true);
    try {
      await createMovement({
        productId: movForm.productId,
        type: movForm.type,
        quantity: Number(movForm.quantity),
        note: movForm.note,
      });
      // Update stock in product
      const product = products.find((p) => p.id === movForm.productId);
      if (product) {
        const newQty =
          movForm.type === 'in'
            ? product.stockQuantity + Number(movForm.quantity)
            : Math.max(0, product.stockQuantity - Number(movForm.quantity));
        await updateProduct(product.id, { stockQuantity: newQty });
      }
      await refreshProducts();
      await refreshInventory();
      toast.success(`Készlet ${movForm.type === 'in' ? 'bevételezve' : 'kiadva'}`);
      setMovOpen(false);
    } catch {
      toast.error('Hiba a mozgás rögzítésekor');
    } finally {
      setMovSaving(false);
    }
  };

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Készletkezelés</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} termék</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Új termék
        </Button>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 p-3 text-yellow-700 dark:text-yellow-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span><strong>{lowStockCount} termék</strong> készlete a minimum szint alatt van vagy eléri azt!</span>
        </div>
      )}

      <SearchInput value={search} onChange={setSearch} placeholder="Keresés név, SKU, kategória alapján..." />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Termék neve</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="hidden sm:table-cell">Kategória</TableHead>
                <TableHead>Ár</TableHead>
                <TableHead>Készlet</TableHead>
                <TableHead className="hidden md:table-cell">Min. szint</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Nincs találat
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => {
                  const isLow = product.stockQuantity <= product.minStockLevel;
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{formatHUF(product.price)}</TableCell>
                      <TableCell>
                        <span className={isLow ? 'text-red-500 font-semibold' : 'font-medium'}>
                          {product.stockQuantity} db
                          {isLow && <AlertTriangle className="inline w-3 h-3 ml-1" />}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {product.minStockLevel} db
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Bevételezés"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => openMov(product, 'in')}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Kiadás"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => openMov(product, 'out')}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Szerkesztés"
                            onClick={() => setEditing(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Törlés"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(product)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} title="Új termék" />

      {editing && (
        <ProductForm
          open={!!editing}
          onOpenChange={(o) => { if (!o) setEditing(null); }}
          initial={editing}
          onSubmit={handleUpdate}
          title="Termék szerkesztése"
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        description={`Biztosan törlöd "${deleteTarget?.name}" terméket?`}
        onConfirm={handleDelete}
        loading={deleting}
      />

      {/* Movement dialog */}
      <Dialog open={movOpen} onOpenChange={setMovOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {movForm.type === 'in' ? '📥 Bevételezés' : '📤 Kiadás'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMovement} className="space-y-4 mt-2">
            <div>
              <p className="text-sm text-muted-foreground">
                Termék: <strong>{products.find((p) => p.id === movForm.productId)?.name}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Jelenlegi készlet: <strong>{products.find((p) => p.id === movForm.productId)?.stockQuantity} db</strong>
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="movQty">Mennyiség (db) *</Label>
              <Input
                id="movQty"
                type="number"
                min={1}
                value={movForm.quantity}
                onChange={(e) => setMovForm((f) => ({ ...f, quantity: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="movNote">Megjegyzés</Label>
              <Input
                id="movNote"
                value={movForm.note}
                onChange={(e) => setMovForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="pl. Kiszállítás, belső felhasználás..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setMovOpen(false)} disabled={movSaving}>
                Mégse
              </Button>
              <Button type="submit" disabled={movSaving}>
                {movSaving ? 'Rögzítés...' : 'Rögzítés'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
