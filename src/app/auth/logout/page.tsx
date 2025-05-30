"use client"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "../../../components/Layouts/DefaultLayout";
import LogOut from "../../../components/logOut";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

const Logout = () => {  
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem('isAuthenticated');
    router.push('/');
  });
  return (
    <DefaultLayout>
      <Breadcrumb pageName="" />

      <div className="flex flex-col gap-10">
        <LogOut />
      </div>
    </DefaultLayout>
  );
};

export default Logout;
