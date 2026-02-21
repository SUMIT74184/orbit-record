import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Trash2, Camera, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const Settings = () => {
  const { toast } = useToast();
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your profile has been updated." });
  };

  const handleDelete = () => {
    toast({ title: "Account deletion", description: "This requires Cloud backend to be enabled.", variant: "destructive" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User size={18} className="text-primary" /> Profile
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                JD
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground">
                <Camera size={12} />
              </button>
            </div>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              <Label className="text-sm">Full Name</Label>
              <div className="relative mt-1.5">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-11 bg-secondary border-border" />
              </div>
            </div>
            <div>
              <Label className="text-sm">Email</Label>
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11 bg-secondary border-border" />
              </div>
            </div>
            <Button variant="hero" className="w-fit" onClick={handleSave}>Save Changes</Button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell size={18} className="text-primary" /> Notifications
          </h2>
          <div className="space-y-4">
            {[
              { label: "Email notifications", desc: "Receive updates via email" },
              { label: "Task reminders", desc: "Get reminded about upcoming deadlines" },
              { label: "Weekly digest", desc: "Summary of your weekly progress" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield size={18} className="text-primary" /> Security
          </h2>
          <div>
            <Label className="text-sm">Change Password</Label>
            <div className="relative mt-1.5">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" placeholder="New password" className="pl-10 h-11 bg-secondary border-border" />
            </div>
          </div>
          <Button variant="outline" className="mt-4">Update Password</Button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-destructive/30">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-destructive">
            <Trash2 size={18} /> Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, all your data will be permanently removed. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={handleDelete}>Delete Account</Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
