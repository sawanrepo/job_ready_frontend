import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Mail, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";


const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.full_name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user?.full_name) {
      setName(user.full_name);
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name === user?.full_name) return;
    
    setIsUpdatingProfile(true);
    await updateProfile(name);
    setIsUpdatingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/;
    if (!passwordRegex.test(passwords.new)) {
      alert("New password must be 8-16 characters long and include uppercase, lowercase, number, and special character.");
      return;
    }
    
    setIsUpdatingPassword(true);
    const success = await changePassword(passwords.current, passwords.new);
    if (success) {
      setPasswords({ current: "", new: "", confirm: "" });
    }
    setIsUpdatingPassword(false);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <div className="container mx-auto px-4 pt-12 pb-12 max-w-4xl">

        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-foreground mb-2 font-poppins">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and security preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full sm:w-1/2 grid-cols-2 mb-8 bg-black/5 border rounded-xl p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">Profile</TabsTrigger>
            {!user?.is_google_oauth && (
              <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">Security</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <Card className="bg-white border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update your personal details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="pl-10 h-12 bg-secondary/20 border-input text-muted-foreground/80 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground/60 ml-1">Your email address cannot be changed.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className="pl-10 h-12 border-input text-foreground focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="h-12 w-full sm:w-auto px-8 gradient-primary font-semibold hover:shadow-glow transition-all"
                    disabled={isUpdatingProfile || name === user?.full_name}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdatingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {!user?.is_google_oauth && (
            <TabsContent value="security" className="mt-0">
              <Card className="bg-white border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                    <Lock className="h-6 w-6 text-primary" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Ensure your account is using a long, random password to stay secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/80 ml-1">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                        <Input
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                          required
                          className="pl-10 h-12 border-input text-foreground focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80 ml-1">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                          <Input
                            type="password"
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            required
                            placeholder="Min 8 chars, A-z, 0-9, !@#"
                            className="pl-10 h-12 border-input text-foreground focus:border-primary/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80 ml-1">Confirm New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                          <Input
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            required
                            minLength={6}
                            className="pl-10 h-12 border-input text-foreground focus:border-primary/50"
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="h-12 w-full sm:w-auto px-8 gradient-primary font-semibold hover:shadow-glow transition-all"
                      disabled={isUpdatingPassword || !passwords.current || !passwords.new || !passwords.confirm}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
