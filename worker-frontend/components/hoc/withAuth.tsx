"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "../ui/loader";
import axios from "axios";

const withAuth = (WrappedComponent: React.ComponentType) => {
  const WithAuthComponent = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const redirectToLogin = () => {
      toast.error("Please authenticate wallet to continue", {
        classNames: {
          toast: "toast-error",
        },
      });
      setIsAuthenticated(false);
      router.push("/");
    };

    useEffect(() => {
      const checkAuthentication = async () => {
        try {
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("token")
              : null;
          if (!token) {
            redirectToLogin();
            return;
          }
          const res = await axios.get(`${BACKEND_URL}/verify`, {
            headers: {
              Authorization: token,
            },
          });
          if (res.status == 200) {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.log(error);
          redirectToLogin();
        } finally {
          setIsLoading(false);
        }
      };

      checkAuthentication();
    }, [router]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <Loader className={"bg-white"} />
        </div>
      );
    }
    return isAuthenticated ? <WrappedComponent /> : null;
  };
  WithAuthComponent.displayName = `WithAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithAuthComponent;
};

export default withAuth;
