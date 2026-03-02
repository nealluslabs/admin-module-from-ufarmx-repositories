import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HiOutlineSquares2X2, 
  HiOutlineClipboardDocumentList, 
  HiOutlineMapPin, 
  HiArrowLeftOnRectangle, 
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineUserCircle,
  HiOutlineUserGroup,
  HiOutlineBuildingStorefront,
} from 'react-icons/hi2';
import { FaWpforms } from 'react-icons/fa';
import { FiTrendingUp } from 'react-icons/fi';
import { Logo } from './Logo';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES, ROUTES_GROUP } from '@/utils/routes';
import { cn } from '@/lib/utils';

interface SidebarLink {
  title: string;
  url: string;
  icon: React.ReactNode;
  routeGroup?: readonly string[];
  roles?: string[];
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const sidebarLinks: SidebarLink[] = [
    {
      title: 'Dashboard',
      url: ROUTES.DASHBOARD,
      icon: <HiOutlineSquares2X2 className="w-5 h-5" />,
    },
    {
      title: 'Forms',
      url: ROUTES.FORMS,
      icon: <FaWpforms className="w-5 h-5" />,
      routeGroup: ROUTES_GROUP.FORMS,
    },
    {
      title: 'Admins',
      url: ROUTES.ADMINS,
      icon: <HiOutlineShieldCheck className="w-5 h-5" />,
      routeGroup: ROUTES_GROUP.ADMINS,
      roles: ['superadmin'],
    },
    {
      title: 'Agents',
      url: ROUTES.AGENTS,
      icon: <HiOutlineUserCircle className="w-5 h-5" />,
      routeGroup: ROUTES_GROUP.AGENTS,
    },
    {
      title: 'Retailers',
      url: ROUTES.RETAILERS,
      icon: <HiOutlineBuildingStorefront className="w-5 h-5" />,
      routeGroup: ROUTES_GROUP.RETAILERS,
    },
    {
      title: 'Farmers',
      url: ROUTES.FARMERS,
      icon: <HiOutlineUserGroup className="w-5 h-5" />,
      routeGroup: ROUTES_GROUP.FARMERS,
    },
    {
      title: 'Credit Scores',
      url: ROUTES.CREDIT_SCORE_CALCULATORS,
      icon: <FiTrendingUp className="w-5 h-5" />,
      routeGroup: ROUTES_GROUP.CREDIT_SCORE_CALCULATORS,
    },
    {
      title: 'Responses',
      url: ROUTES.RESPONSES,
      icon: <HiOutlineClipboardDocumentList className="w-5 h-5" />,
    },
    {
      title: 'Maps',
      url: ROUTES.MAPS,
      icon: <HiOutlineMapPin className="w-5 h-5" />,
    },
  ];

  const isLinkActive = (link: SidebarLink): boolean => {
    if (link.routeGroup) {
      return link.routeGroup.includes(location.pathname);
    }
    return link.url === location.pathname;
  };

  const activeStyle = 'bg-primary text-primary-foreground hover:bg-primary/90';
  const inactiveStyle = 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';

  const filteredLinks = sidebarLinks.filter(
    (link) => !link.roles || link.roles.includes(user?.role?.toLowerCase() || '')
  );

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-8">
        <Logo />
      </div>
      
      <nav className="flex flex-1 flex-col gap-2">
        {filteredLinks.map((link) => (
          <Link
            key={link.title}
            to={link.url}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isLinkActive(link) ? activeStyle : inactiveStyle
            )}
          >
            {link.icon}
            <span>{link.title}</span>
          </Link>
        ))}

        <button
          onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            location.pathname === ROUTES.CHANGE_PASSWORD ? activeStyle : inactiveStyle
          )}
        >
          <HiOutlineKey className="w-5 h-5" />
          <span>Change Password</span>
        </button>

        <button
          onClick={() => {
            logout();
            navigate(ROUTES.LOGIN);
          }}
          className={cn(
            'mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            inactiveStyle
          )}
        >
          <HiArrowLeftOnRectangle className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
