export type UserRole = "admin" | "analyst" | "client";

export interface Permission {
  canAccessDashboard: boolean;
  canAccessEditor: boolean;
  canAccessFiles: boolean;
  canAccessSettings: boolean;
  canEditSettings: boolean;
  canCreateDocuments: boolean;
  canEditDocuments: boolean;
  canDeleteDocuments: boolean;
  canViewDocuments: boolean;
  canDownloadDocuments: boolean;
  canEmailDocuments: boolean;
}

export function getPermissions(role: UserRole | undefined): Permission {
  if (!role) {
    return {
      canAccessDashboard: false,
      canAccessEditor: false,
      canAccessFiles: false,
      canAccessSettings: false,
      canEditSettings: false,
      canCreateDocuments: false,
      canEditDocuments: false,
      canDeleteDocuments: false,
      canViewDocuments: false,
      canDownloadDocuments: false,
      canEmailDocuments: false,
    };
  }

  switch (role) {
    case "admin":
      return {
        canAccessDashboard: true,
        canAccessEditor: true,
        canAccessFiles: true,
        canAccessSettings: true,
        canEditSettings: true,
        canCreateDocuments: true,
        canEditDocuments: true,
        canDeleteDocuments: true,
        canViewDocuments: true,
        canDownloadDocuments: true,
        canEmailDocuments: true,
      };

    case "analyst":
      return {
        canAccessDashboard: true,
        canAccessEditor: true,
        canAccessFiles: true,
        canAccessSettings: true,
        canEditSettings: false,
        canCreateDocuments: true,
        canEditDocuments: true,
        canDeleteDocuments: true,
        canViewDocuments: true,
        canDownloadDocuments: true,
        canEmailDocuments: true,
      };

    case "client":
      return {
        canAccessDashboard: false,
        canAccessEditor: false,
        canAccessFiles: true,
        canAccessSettings: false,
        canEditSettings: false,
        canCreateDocuments: false,
        canEditDocuments: false,
        canDeleteDocuments: false,
        canViewDocuments: true,
        canDownloadDocuments: true,
        canEmailDocuments: false,
      };

    default:
      return {
        canAccessDashboard: false,
        canAccessEditor: false,
        canAccessFiles: false,
        canAccessSettings: false,
        canEditSettings: false,
        canCreateDocuments: false,
        canEditDocuments: false,
        canDeleteDocuments: false,
        canViewDocuments: false,
        canDownloadDocuments: false,
        canEmailDocuments: false,
      };
  }
}

export function canAccessRoute(role: UserRole | undefined, path: string): boolean {
  const permissions = getPermissions(role);

  switch (path) {
    case "/dashboard":
      return permissions.canAccessDashboard;
    case "/editor":
      return permissions.canAccessEditor;
    case "/files":
      return permissions.canAccessFiles;
    case "/settings":
      return permissions.canAccessSettings;
    default:
      return true;
  }
}
