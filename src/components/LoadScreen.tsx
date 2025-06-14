import {
  ChevronRightIcon,
  FolderIcon,
  LogInIcon,
  LogOutIcon,
  ShieldQuestionIcon,
  SquarePlusIcon,
  TrashIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../firebase';
import useBrowserSpaces from '../hooks/useBrowserSpaces';
import useSyncAllSpaces from '../hooks/useSyncAllSpaces';
import {
  APP_SLOGAN,
  APP_SPACE_LIMIT_REACHED,
  createNewSpace,
  importFile,
  type Space,
} from '../lib';
import { join } from '../utils';
import DreamTrigger from './DreamTrigger';
import AuthModal from './modals/AuthModal';
import DeleteSpaceModal from './modals/DeleteSpaceModal';
import HelpModal from './modals/HelpModal';
import ThemeToggle2 from './ui/ThemeToggle2';
import Tooltip from './ui/Tooltip';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
}

const DEFAULT_ITEMS: MenuItem[] = [
  {
    icon: <SquarePlusIcon />,
    label: 'New Space',
  },
  {
    icon: <FolderIcon />,
    label: 'Open',
  },
  {
    icon: <ShieldQuestionIcon />,
    label: 'Help',
  },
];
export default function LoadScreen() {
  const { currentUser } = useAuth();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deleteSpaceId, setDeleteSpaceId] = useState<string>();
  const [deletedSpaceIds, setDeletedSpaceIds] = useState<Set<string>>(
    new Set(),
  );
  const { spaces: localSpaces, limitMet } = useBrowserSpaces();
  const { spaces: syncedSpaces, spacesMap: syncedSpacesMap } =
    useSyncAllSpaces();

  const spaces = useMemo(() => {
    let chosenSpaces: Space[] = [];
    if (currentUser?.uid) {
      chosenSpaces = syncedSpaces;

      // Add in any local spaces that are not synced yet
      /* This serves two purposes:
       * 1. It allows users to see their local spaces that haven't been synced yet.
       * 2. It ensures that all synced spaces that were saved locally when app mounts
       *   are still visible, as they will not be fetched again in `useSyncAllSpaces`
       *   (due to `fetchAllSpacesAndUploadToLocalStorage` only being called when local
       *   and server timestamps for `ALL_SPACES_LAST_SYNC_KEY` do not match).
       */
      localSpaces.forEach((localSpace) => {
        if (!syncedSpacesMap[localSpace.id]) {
          chosenSpaces.push(localSpace);
        }
      });
    } else {
      chosenSpaces = localSpaces.filter((space) => !space.metadata?.createdBy);
    }

    const filteredSpaces = chosenSpaces.filter(
      (s) => !deletedSpaceIds.has(s.id),
    );
    const sortedSpaces = filteredSpaces.sort((a, b) => {
      const aUpdated = a.metadata?.updatedAt ?? 0;
      const bUpdated = b.metadata?.updatedAt ?? 0;
      if (bUpdated !== aUpdated) {
        return bUpdated - aUpdated;
      }
      return a.title.localeCompare(b.title);
    });
    return sortedSpaces;
  }, [
    localSpaces,
    syncedSpaces,
    syncedSpacesMap,
    currentUser?.uid,
    deletedSpaceIds,
  ]);

  const items = useMemo(() => {
    if (currentUser) {
      return [
        ...DEFAULT_ITEMS,
        {
          icon: <LogOutIcon />,
          label: 'Sign Out',
        },
      ];
    }

    return [
      ...DEFAULT_ITEMS,
      {
        icon: <LogInIcon />,
        label: 'Login',
      },
    ];
  }, [currentUser]);

  const handleClick = (label: string) => {
    switch (label) {
      case 'New Space':
        createNewSpace();
        break;
      case 'Open':
        importFile();
        break;
      case 'Help':
        setIsHelpModalOpen(true);
        break;
      case 'Login':
        setIsAuthModalOpen(true);
        break;
      case 'Sign Out':
        signOutUser();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <ThemeToggle2 />

      <div className='absolute top-0 left-0 z-10 flex min-h-screen w-screen'>
        <div className='bg-background-light/70 dark:bg-background-dark/70 relative m-auto w-48 py-1'>
          <div className='absolute -top-3 -left-14 w-full min-w-fit -translate-y-full'>
            <div className='text-brand relative'>
              <h1 className='font-brand min-w-fit text-center text-9xl font-black'>
                Akyl
              </h1>
              <span className='absolute -top-1 -right-3 text-xl'>©</span>
            </div>
            <p className='text-brand mt-1 text-center font-medium'>
              {APP_SLOGAN}
            </p>
          </div>

          {items.map((item, index) => {
            const Icon = (item.icon as React.ReactElement).type;
            const isDisabled = item.label === 'New Space' && limitMet;
            return (
              <Tooltip
                key={index}
                title={APP_SPACE_LIMIT_REACHED}
                disabled={!isDisabled}
              >
                <button
                  type='button'
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    handleClick(item.label);
                  }}
                  className='flex w-full flex-row items-center gap-1.5 px-4 py-2 text-left text-gray-500 enabled:hover:bg-black/5 enabled:hover:text-gray-900 disabled:cursor-not-allowed enabled:hover:dark:bg-white/5 enabled:hover:dark:text-gray-100'
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              </Tooltip>
            );
          })}

          {currentUser?.email && (
            <small className='block min-w-full text-center whitespace-nowrap'>
              <span className='mr-1 font-light text-gray-500 dark:text-gray-400'>
                Logged in as
              </span>
              <br />
              <span>{currentUser?.email}</span>
            </small>
          )}

          {spaces.length > 0 && (
            <div className='absolute -bottom-8 left-0 flex w-full translate-y-full flex-col items-center'>
              <h2 className='pb-1 text-center text-sm font-medium text-gray-700 dark:text-gray-300'>
                Previous Spaces
              </h2>
              <div className='w-lg'>
                <div className='max-h-68 overflow-y-auto rounded-sm border border-gray-300 dark:border-gray-700'>
                  <div className='grid grid-cols-2 gap-1'>
                    {spaces.map((space) => (
                      <div
                        key={space.id}
                        className='group relative flex flex-row items-center gap-1 rounded-sm px-4 py-2 text-left text-gray-500 hover:bg-black/5 hover:text-gray-900 hover:dark:bg-white/5 hover:dark:text-gray-100'
                      >
                        <a
                          role='button'
                          href={`/${space.id}`}
                          className='flex flex-1 flex-row items-center gap-1'
                        >
                          <ChevronRightIcon className='size-4' />
                          <span
                            title={space.title || 'Untitled Space'}
                            className={join(
                              'w-44 truncate',
                              space.title.length === 0 && 'opacity-70',
                            )}
                          >
                            {space.title || 'Untitled Space'}
                          </span>
                        </a>
                        <TrashIcon
                          role='button'
                          className='ml-2 size-4 shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500'
                          aria-label='Delete Space'
                          onClick={() => setDeleteSpaceId(space.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='absolute bottom-0 left-0 z-10 p-1'>
        <DreamTrigger />
      </div>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <DeleteSpaceModal
        isOpen={Boolean(deleteSpaceId)}
        onClose={() => setDeleteSpaceId(undefined)}
        spaceId={deleteSpaceId}
        onDelete={(id) => {
          setDeletedSpaceIds((prev) => new Set(prev).add(id));
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
