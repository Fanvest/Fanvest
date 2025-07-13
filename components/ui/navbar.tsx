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
        className="cursor-pointer text-[#FEFEFE] hover:text-[#FA0089] font-medium"
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
                className="bg-[#330051]/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-[#FA0089]/30 shadow-xl"
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
      className="relative rounded-full border border-[#330051] bg-[#330051]/30 backdrop-blur-sm shadow-lg flex justify-center space-x-12 px-12 py-4"
    >
      {children}
    </nav>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="text-[#FEFEFE]/80 hover:text-[#FA0089] transition-colors duration-200 block py-1"
    >
      {children}
    </Link>
  );
};

// Navigation principale avec logique conditionnelle
export const FanStockNavbar = () => {
  const [active, setActive] = useState<string | null>(null);
  const { authenticated, user, login, logout } = usePrivy();
  const [userClubs, setUserClubs] = useState<any[]>([]);

  // Charger les clubs de l'utilisateur
  React.useEffect(() => {
    if (authenticated && user?.id) {
      fetch(`/api/clubs?ownerId=${user.id}`)
        .then(res => res.json())
        .then(clubs => setUserClubs(clubs || []))
        .catch(err => console.error('Erreur chargement clubs:', err));
    }
  }, [authenticated, user]);

  const hasClubs = userClubs.length > 0;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Menu setActive={setActive}>
        {/* Logo/Accueil */}
        <Link href="/" className="flex items-center">
          <div className="text-2xl font-bold text-[#FA0089] hover:text-[#FEFEFE] transition-colors">
            FanStock
          </div>
        </Link>

        {/* Navigation conditionnelle */}
        {authenticated ? (
          <>
            {/* Si l'utilisateur a des clubs */}
            {hasClubs ? (
              <>
                {userClubs.map((club) => (
                  <MenuItem key={club.id} setActive={setActive} active={active} item={`🏆 ${club.name}`}>
                    <div className="flex flex-col space-y-2 text-sm min-w-[200px]">
                      <HoveredLink href={`/clubs/${club.id}`}>
                        👁️ Voir la page publique
                      </HoveredLink>
                      <HoveredLink href={`/clubs/${club.id}/polls/create`}>
                        📊 Créer un sondage
                      </HoveredLink>
                      <HoveredLink href={`/clubs/${club.id}/settings`}>
                        ⚙️ Paramètres du club
                      </HoveredLink>
                    </div>
                  </MenuItem>
                ))}

                <MenuItem setActive={setActive} active={active} item="+ Nouveau Club">
                  <div className="flex flex-col space-y-2 text-sm">
                    <HoveredLink href="/register-club">
                      ➕ Créer un nouveau club
                    </HoveredLink>
                    <HoveredLink href="/club-benefits">
                      ⭐ Avantages club
                    </HoveredLink>
                  </div>
                </MenuItem>

                <MenuItem setActive={setActive} active={active} item="Fan">
                  <div className="flex flex-col space-y-2 text-sm">
                    <HoveredLink href="/explore">
                      🔍 Explorer les clubs
                    </HoveredLink>
                    <HoveredLink href="/portfolio">
                      💼 Mon portefeuille
                    </HoveredLink>
                    <HoveredLink href="/investments">
                      📈 Mes investissements
                    </HoveredLink>
                  </div>
                </MenuItem>
              </>
            ) : (
              /* Si l'utilisateur n'a pas de clubs */
              <>
                <MenuItem setActive={setActive} active={active} item="Fan">
                  <div className="flex flex-col space-y-2 text-sm">
                    <HoveredLink href="/explore">
                      🔍 Explorer les clubs
                    </HoveredLink>
                    <HoveredLink href="/portfolio">
                      💼 Mon portefeuille
                    </HoveredLink>
                    <HoveredLink href="/investments">
                      📈 Mes investissements
                    </HoveredLink>
                  </div>
                </MenuItem>

                <MenuItem setActive={setActive} active={active} item="Club">
                  <div className="flex flex-col space-y-2 text-sm">
                    <HoveredLink href="/register-club">
                      🏆 Créer mon club
                    </HoveredLink>
                    <HoveredLink href="/club-benefits">
                      ⭐ Avantages club
                    </HoveredLink>
                  </div>
                </MenuItem>
              </>
            )}

            {/* Réseau - Toujours visible pour les utilisateurs connectés */}
            <div className="flex items-center">
              <span className="text-[#FEFEFE]/60 text-sm font-medium bg-[#330051]/50 px-3 py-1 rounded-full border border-[#330051]">
                🌐 Chiliz Testnet
              </span>
            </div>

            {/* Profil utilisateur */}
            <MenuItem setActive={setActive} active={active} item="Profil">
              <div className="flex flex-col space-y-2 text-sm">
                <div className="text-[#FA0089] font-medium px-2 py-1">
                  {typeof user?.email === 'string' ? user.email : 'Utilisateur'}
                </div>
                <div className="border-t border-[#FA0089]/30 pt-2">
                  <button
                    onClick={logout}
                    className="text-[#FEFEFE]/80 hover:text-[#FA0089] transition-colors w-full text-left py-1"
                  >
                    🚪 Se déconnecter
                  </button>
                </div>
              </div>
            </MenuItem>
          </>
        ) : (
          /* Si l'utilisateur n'est pas connecté */
          <>
            <MenuItem setActive={setActive} active={active} item="Explorer">
              <div className="flex flex-col space-y-2 text-sm">
                <HoveredLink href="/explore">
                  🔍 Découvrir les clubs
                </HoveredLink>
                <HoveredLink href="/how-it-works">
                  ❓ Comment ça marche
                </HoveredLink>
              </div>
            </MenuItem>

            <MenuItem setActive={setActive} active={active} item="Pour les Clubs">
              <div className="flex flex-col space-y-2 text-sm">
                <HoveredLink href="/register-club">
                  🏆 Créer mon club
                </HoveredLink>
                <HoveredLink href="/club-benefits">
                  ⭐ Avantages
                </HoveredLink>
                <HoveredLink href="/pricing">
                  💰 Tarifs
                </HoveredLink>
              </div>
            </MenuItem>

            {/* Réseau - Visible même pour les non-connectés */}
            <div className="flex items-center">
              <span className="text-[#FEFEFE]/60 text-sm font-medium bg-[#330051]/50 px-3 py-1 rounded-full border border-[#330051]">
                🌐 Chiliz Testnet
              </span>
            </div>

            {/* Bouton de connexion */}
            <button
              onClick={login}
              className="bg-[#FA0089] hover:bg-[#FA0089]/80 text-[#FEFEFE] px-6 py-2 rounded-full font-medium transition-colors"
            >
              Se connecter
            </button>
          </>
        )}
      </Menu>
    </div>
  );
};