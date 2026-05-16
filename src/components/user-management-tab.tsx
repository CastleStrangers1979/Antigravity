'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserPlus, Key, Eye, EyeOff, UserCircle, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
}

export default function UserManagementTab() {
  const { t, isRTL } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  
  // Role Simulator for Testing
  const [simulatedRole, setSimulatedRole] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('simulated_role') || 'admin';
    }
    return 'admin';
  });

  const handleSimulateRole = (role: string) => {
    setSimulatedRole(role);
    localStorage.setItem('simulated_role', role);
    toast.success(isRTL ? `تم محاكاة دور: ${role}` : `Simulating role: ${role}`);
    // Refresh page to apply role across all tabs
    window.location.reload();
  };
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: 'employee'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error(isRTL ? 'فشل تحميل المستخدمين' : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      toast.error(isRTL ? 'يرجى ملء كافة الحقول' : 'Please fill all fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (!res.ok) throw new Error('Failed to create');

      toast.success(isRTL ? 'تم إضافة الموظف بنجاح' : 'Employee added successfully');
      setIsAddDialogOpen(false);
      setNewUser({ name: '', username: '', password: '', role: 'employee' });
      fetchUsers();
    } catch (error) {
      toast.error(isRTL ? 'فشل إضافة الموظف' : 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { color: string; label: string }> = {
      admin: { color: 'bg-red-100 text-red-700', label: isRTL ? 'مدير (الآدمن)' : 'Admin' },
      senior_accountant: { color: 'bg-emerald-100 text-emerald-700', label: isRTL ? 'محاسب كبير' : 'Senior Accountant' },
      junior_accountant: { color: 'bg-blue-100 text-blue-700', label: isRTL ? 'محاسب كاش' : 'Junior Accountant' },
      production_head: { color: 'bg-amber-100 text-amber-700', label: isRTL ? 'مسؤول إنتاج' : 'Production Head' },
      delivery_head: { color: 'bg-purple-100 text-purple-700', label: isRTL ? 'مسؤول تسليم' : 'Delivery Head' },
      employee: { color: 'bg-gray-100 text-gray-700', label: isRTL ? 'موظف' : 'Employee' },
    };
    const r = roles[role] || roles.employee;
    return <Badge className={r.color}>{r.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <Shield className="h-7 w-7 text-[#D4A853]" />
            {isRTL ? 'إدارة المستخدمين والصلاحيات' : 'User Management & Permissions'}
          </h2>
          <p className="text-muted-foreground">{isRTL ? 'تخصيص الواجهات وحماية البيانات الحساسة' : 'Interface customization and sensitive data protection'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-3">
            <span className="text-xs font-bold text-amber-700">{isRTL ? 'وضع التجربة (المحاكاة):' : 'Testing Mode (Simulate):'}</span>
            <Select value={simulatedRole} onValueChange={handleSimulateRole}>
              <SelectTrigger className="h-8 w-[180px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="admin">{isRTL ? 'أدمن (رؤية كاملة)' : 'Admin (Full View)'}</SelectItem>
                <SelectItem value="junior_accountant">{isRTL ? 'محاسب كاش (حجب)' : 'Junior (Masked)'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-white border-0">
              <UserPlus className="h-4 w-4 mr-2" />
              {isRTL ? 'إضافة موظف جديد' : 'Add New Employee'}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>{isRTL ? 'إضافة موظف جديد' : 'Add New Employee'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الاسم الكامل' : 'Full Name'}</Label>
                <Input 
                  placeholder="أحمد محمد" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'اسم المستخدم' : 'Username'}</Label>
                <Input 
                  placeholder="ahmed123" 
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'كلمة المرور' : 'Password'}</Label>
                <Input 
                  type="password" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الصلاحية' : 'Role'}</Label>
                <Select value={newUser.role} onValueChange={(val) => setNewUser({...newUser, role: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="admin">{isRTL ? 'مدير (الآدمن)' : 'Admin'}</SelectItem>
                    <SelectItem value="senior_accountant">{isRTL ? 'محاسب كبير' : 'Senior Accountant'}</SelectItem>
                    <SelectItem value="junior_accountant">{isRTL ? 'محاسب كاش' : 'Junior Accountant'}</SelectItem>
                    <SelectItem value="production_head">{isRTL ? 'مسؤول إنتاج' : 'Production Head'}</SelectItem>
                    <SelectItem value="delivery_head">{isRTL ? 'مسؤول تسليم' : 'Delivery Head'}</SelectItem>
                    <SelectItem value="employee">{isRTL ? 'موظف عادي' : 'Employee'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button 
                className="gold-gradient text-white border-0" 
                onClick={handleAddUser}
                disabled={submitting}
              >
                {submitting ? (isRTL ? 'جاري الإضافة...' : 'Adding...') : (isRTL ? 'حفظ الموظف' : 'Save Employee')}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics or Key Info */}
        <Card className="border-0 shadow-md bg-[#2D5A3D] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              {isRTL ? 'مستوى الحماية' : 'Security Level'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">100%</p>
            <p className="text-sm text-white/80 mt-1">{isRTL ? 'يتم حجب الأرقام الكبيرة عن 80% من المستخدمين' : 'Large totals masked for 80% of users'}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#3D3229]">{isRTL ? 'الحسابات النشطة' : 'Active Accounts'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#D4A853]">{users.length}</p>
            <p className="text-sm text-muted-foreground mt-1">{isRTL ? 'تم توزيع المهام بناءً على الصلاحيات' : 'Tasks distributed based on permissions'}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#3D3229]">{isRTL ? 'آخر العمليات' : 'Recent Activity'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">{isRTL ? 'تم تحديث صلاحيات "محاسب الكاش" قبل ساعة' : 'Junior Accountant permissions updated 1h ago'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-[#F5EDE0] border-b">
          <CardTitle className="text-[#3D3229]">{isRTL ? 'قائمة الموظفين' : 'Employee List'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                <TableHead>{isRTL ? 'اسم المستخدم' : 'Username'}</TableHead>
                <TableHead>{isRTL ? 'الصلاحية' : 'Role'}</TableHead>
                <TableHead>{isRTL ? 'حالة الحساب' : 'Status'}</TableHead>
                <TableHead>{isRTL ? 'آخر ظهور' : 'Last Login'}</TableHead>
                <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#D4A853]/20 flex items-center justify-center text-[#D4A853]">
                        <UserCircle className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-[#3D3229]">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{user.username}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'} className={user.isActive ? 'bg-green-100 text-green-700' : ''}>
                      {user.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Disabled')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.lastLogin || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toast.info(isRTL ? 'تحرير الصلاحيات...' : 'Editing permissions...')}>
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                    {isRTL ? 'لا يوجد مستخدمين مضافين حالياً' : 'No users added yet'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Explanation Card */}
      <Card className="border-dashed border-2 border-[#D4A853]/30 bg-[#FDFBF7]">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#D4A853] uppercase tracking-wider">{isRTL ? 'دليل حماية البيانات' : 'Data Protection Policy'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-[#5C4033]">
            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
            <p><strong>{isRTL ? 'المحاسب المبتدئ:' : 'Junior Accountant:'}</strong> {isRTL ? 'يرى المبيعات اليومية فقط، تُحجب عنه الأرقام السنوية والشهرية الضخمة.' : 'Daily sales only; masked monthly/yearly totals.'}</p>
          </div>
          <div className="flex items-start gap-2 text-sm text-[#5C4033]">
            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
            <p><strong>{isRTL ? 'مسؤول الإنتاج:' : 'Production Head:'}</strong> {isRTL ? 'يرى الكميات والمواد الخام فقط، لا يرى أي أرقام مالية.' : 'Quantities and raw materials only; no financial data.'}</p>
          </div>
          <div className="flex items-start gap-2 text-sm text-[#5C4033]">
            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
            <p><strong>{isRTL ? 'المدير (البوس):' : 'The Boss:'}</strong> {isRTL ? 'رؤية مطلقة لكافة التقارير والأرقام.' : 'Full visibility of all reports and numbers.'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
