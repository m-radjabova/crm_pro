import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import CreateContextPro from "./hooks/CreateContextPro.tsx";
import { ToastContainer } from "react-toastify";
import { HelmetProvider } from "react-helmet-async";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <CreateContextPro>
            <App />
            <ToastContainer
            position="top-right"
            autoClose={3600}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss={false}
            pauseOnHover
            draggable={false}
            theme="light"
            limit={3}
            closeButton={false}
            icon={false}
            />
          </CreateContextPro>
        </HelmetProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
