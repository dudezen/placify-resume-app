import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth, type Role } from "@/lib/auth";
import { toast } from "sonner";
import { AuthShell } from "./login";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: (search.role as Role) || "user",
  }),
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create account — Placify" },
      { name: "description", content: "Create your Placify account." },
    ],
  }),
});

function RegisterPage() {
  const { role: initialRole } = Route.useSearch();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Enter your name");
    if (!email.includes("@")) return toast.error("Enter a valid email");
    if (password.length < 4) return toast.error("Password too short");
    login({ email, name, role });
    toast.success("Account created");
    navigate({ to: role === "user" ? "/dashboard/user" : "/dashboard/recruiter" });
  };

  return (
    <AuthShell
      mode="register"
      role={role}
      setRole={setRole}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      name={name}
      setName={setName}
      onSubmit={onSubmit}
    />
  );
}
