import { useState, useRef } from "react";
import { Settings, LogOut, Save, Menu, X, Camera, Trash2, Navigation } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LoginDialog } from "./LoginDialog";
import { NavConfigPanel } from "./NavConfigPanel";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useProfilePhoto } from "../hooks/useProfilePhoto";
import { useNavConfig } from "../hooks/useNavConfig";
import { useSectionOrder } from "../hooks/useSectionOrder";
import defaultPhoto from "../../imports/image.png";

interface HeaderProps {
  isEditing: boolean;
  isAuthenticated: boolean;
  onToggleEdit: () => void;
  onLogin: (email: string, password: string) => void;
  onLogout: () => void;
}

export function Header({ isEditing, isAuthenticated, onToggleEdit, onLogin, onLogout }: HeaderProps) {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [navPanelOpen, setNavPanelOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { customPhoto, upload, remove } = useProfilePhoto();
  const { items: navItems, save: saveNav, addItem: addNavItem, removeItem: removeNavItem, updateItem: updateNavItem } = useNavConfig();
  const { sections } = useSectionOrder();

  const photoSrc = customPhoto || defaultPhoto;

  const handleLogin = (email: string, password: string) => {
    onLogin(email, password);
    setShowLoginDialog(false);
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    setMobileMenuOpen(false);
    if (item.isExternal && item.href) {
      window.open(item.href, "_blank", "noopener noreferrer");
      return;
    }
    if (item.targetId) {
      document.getElementById(item.targetId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload(file);
    setShowPhotoMenu(false);
    e.target.value = "";
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => isEditing ? setShowPhotoMenu((v) => !v) : window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`w-10 h-10 rounded-full overflow-hidden ring-2 transition-all relative ${isEditing ? "ring-blue-500 hover:ring-blue-400" : "ring-blue-600/30 hover:ring-blue-600"}`}
                aria-label={isEditing ? "Change profile photo" : "Scroll to top"}
              >
                {customPhoto ? (
                  <img src={customPhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <ImageWithFallback src={defaultPhoto} alt="Rishabh Mishra" className="w-full h-full object-cover" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {/* Photo menu */}
              {isEditing && showPhotoMenu && (
                <div className="absolute top-12 left-0 z-50 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 w-48 overflow-hidden">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left">
                    <Camera className="w-4 h-4 text-blue-600" />
                    {customPhoto ? "Replace photo" : "Upload photo"}
                  </button>
                  {customPhoto && (
                    <button onClick={() => { remove(); setShowPhotoMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors text-left border-t border-neutral-100 dark:border-neutral-700">
                      <Trash2 className="w-4 h-4" />
                      Remove photo
                    </button>
                  )}
                  <button onClick={() => setShowPhotoMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left border-t border-neutral-100 dark:border-neutral-700 text-neutral-500">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item.label}
                </button>
              ))}

              {/* Edit nav button */}
              {isEditing && (
                <button
                  onClick={() => setNavPanelOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40 rounded-lg text-sm transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Edit Nav
                </button>
              )}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {!isAuthenticated ? (
                <button
                  onClick={() => setShowLoginDialog(true)}
                  className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={onToggleEdit}
                    className={`p-2 rounded-lg transition-colors ${isEditing ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700"}`}
                    aria-label={isEditing ? "Exit edit mode" : "Edit content"}
                  >
                    {isEditing ? <Save className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                  </button>
                  <button onClick={onLogout} className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-red-600 hover:text-white transition-colors" aria-label="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="text-left text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              {isEditing && (
                <button
                  onClick={() => { setNavPanelOpen(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Edit Navigation
                </button>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Close photo menu backdrop */}
      {showPhotoMenu && <div className="fixed inset-0 z-40" onClick={() => setShowPhotoMenu(false)} />}

      <LoginDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} onLogin={handleLogin} />

      <NavConfigPanel
        isOpen={navPanelOpen}
        onClose={() => setNavPanelOpen(false)}
        items={navItems}
        sections={sections}
        onSave={saveNav}
        onAdd={addNavItem}
        onRemove={removeNavItem}
        onUpdate={updateNavItem}
      />
    </>
  );
}
