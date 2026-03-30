export {};

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: GoogleCredentialResponse) => void;
                    }) => void;
                    renderButton: (
                        parent: HTMLElement,
                        options: Record<string, string | number | boolean>
                    ) => void;
                    cancel: () => void;
                };
            };
        };
    }

    interface GoogleCredentialResponse {
        credential: string;
        select_by: string;
    }
}
