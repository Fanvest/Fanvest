"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePrivy } from '@privy-io/react-auth';

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-text-primary hover:text-accent-primary font-medium"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-200/50 shadow-2xl"
                style={{
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                }}
              >
                <motion.div
                  layout
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-accent-secondary bg-accent-secondary/30 backdrop-blur-sm shadow-lg flex items-center justify-center space-x-8 px-8 py-3"
    >
      {children}
    </nav>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="text-gray-700 hover:text-[#fa0089] transition-colors duration-200 block py-1"
    >
      {children}
    </Link>
  );
};

// Main navigation with conditional logic
export const FanStockNavbar = () => {
  const [active, setActive] = useState<string | null>(null);
  const { authenticated, user, login, logout } = usePrivy();
  const [userClubs, setUserClubs] = useState<any[]>([]);

  // Load user's clubs
  React.useEffect(() => {
    if (authenticated && user?.id) {
      fetch(`/api/clubs?ownerId=${user.id}`)
        .then(res => res.json())
        .then(clubs => setUserClubs(clubs || []))
        .catch(err => console.error('Error loading clubs:', err));
    }
  }, [authenticated, user]);

  const hasClubs = userClubs.length > 0;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Menu setActive={setActive}>
        {/* Logo/Home */}
        <Link href="/" className="flex items-center mr-4">
          <div className="text-xl font-bold text-accent-primary hover:text-text-primary transition-colors">
            FanStock
          </div>
        </Link>

        {/* Conditional navigation */}
        {authenticated ? (
          <>
            {/* If user has clubs */}
            {hasClubs ? (
              <>
                <MenuItem setActive={setActive} active={active} item="My Club">
                  <div className="flex flex-col space-y-2 text-sm min-w-[250px]">
                    {userClubs.map((club) => (
                      <div key={club.id} className="group">
                        <a 
                          href={`/dashboard/club?clubId=${club.id}`}
                          className="block text-gray-800 hover:text-[#fa0089] transition-colors py-1 px-2 hover:bg-pink-50 rounded cursor-pointer"
                        >
                          🏆 {club.name}
                        </a>
                        {/* Submenu that appears below */}
                        <div className="pl-4 space-y-1 max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-300 ease-in-out">
                          <a 
                            href={`/clubs/${club.id}`}
                            className="block text-gray-600 hover:text-[#fa0089] transition-colors py-1 px-2 hover:bg-pink-50 rounded text-sm"
                          >
                            👁️ View public page
                          </a>
                          <a 
                            href={`/clubs/${club.id}/polls/create`}
                            className="block text-gray-600 hover:text-[#fa0089] transition-colors py-1 px-2 hover:bg-pink-50 rounded text-sm"
                          >
                            📊 Create a poll
                          </a>
                          <a 
                            href={`/clubs/${club.id}/settings`}
                            className="block text-gray-600 hover:text-[#fa0089] transition-colors py-1 px-2 hover:bg-pink-50 rounded text-sm"
                          >
                            ⚙️ Club settings
                          </a>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <HoveredLink href="/register-club">
                        ➕ Create a new club
                      </HoveredLink>
                    </div>
                  </div>
                </MenuItem>

                <MenuItem setActive={setActive} active={active} item="Fan">
                  <div className="flex flex-col space-y-2 text-sm">
                    <HoveredLink href="/explore">
                      🔍 Explore clubs
                    </HoveredLink>
                    <HoveredLink href="/portfolio">
                      💼 My portfolio
                    </HoveredLink>
                    <HoveredLink href="/investments">
                      📈 My investments
                    </HoveredLink>
                  </div>
                </MenuItem>
              </>
            ) : (
              /* If user doesn't have clubs */
              <>
                <MenuItem setActive={setActive} active={active} item="Fan">
                  <div className="flex flex-col space-y-2 text-sm">
                    <HoveredLink href="/explore">
                      🔍 Explore clubs
                    </HoveredLink>
                  </div>
                </MenuItem>

                <MenuItem setActive={setActive} active={active} item="Club">
                  <div className="flex flex-col space-y-2 text-sm">
                    <HoveredLink href="/register-club">
                      🏆 Create my club
                    </HoveredLink>
                  </div>
                </MenuItem>
              </>
            )}

            {/* Network - Always visible for logged in users */}
            <div className="flex items-center">
              <span className="text-text-primary/60 text-sm font-medium bg-accent-secondary/50 px-3 py-1 rounded-full border border-accent-secondary">
                🌐 Chiliz Testnet
              </span>
            </div>

            {/* User profile */}
            <MenuItem setActive={setActive} active={active} item="Profile">
              <div className="flex flex-col space-y-2 text-sm">
                <div className="text-[#fa0089] font-medium px-2 py-1">
                  {typeof user?.email === 'string' ? user.email : 'User'}
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-[#fa0089] transition-colors w-full text-left py-1"
                  >
                    🚪 Log out
                  </button>
                </div>
              </div>
            </MenuItem>
          </>
        ) : (
          /* If user is not logged in */
          <>
            <MenuItem setActive={setActive} active={active} item="Explore">
              <div className="flex flex-col space-y-2 text-sm">
                <HoveredLink href="/explore">
                  🔍 Discover clubs
                </HoveredLink>
              </div>
            </MenuItem>

            <MenuItem setActive={setActive} active={active} item="For Clubs">
              <div className="flex flex-col space-y-2 text-sm">
                <HoveredLink href="/register-club">
                  🏆 Create my club
                </HoveredLink>
              </div>
            </MenuItem>

            {/* Network - Visible even for non-connected users */}
            <div className="flex items-center">
              <span className="text-text-primary/60 text-sm font-medium bg-accent-secondary/50 px-3 py-1 rounded-full border border-accent-secondary">
                🌐 Chiliz Testnet
              </span>
            </div>

            {/* Login button */}
            <button
              onClick={login}
              className="bg-accent-primary hover:bg-accent-primary/80 text-text-primary px-6 py-2 rounded-full font-medium transition-colors"
            >
              Login
            </button>
          </>
        )}
      </Menu>
    </div>
  );
};