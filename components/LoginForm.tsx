"use client";

import { useActionState } from "react";
import { signIn } from "@/app/login/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <div className="w-full max-w-[392px]">
      <h2 className="mb-[6px] font-display text-[30px] font-semibold text-[#3F362E]">
        Iniciar sesión
      </h2>
      <p className="mb-[28px] text-[15px] text-[#94887B]">
        Ingresá para ver el día de hoy.
      </p>

      <form action={formAction}>
        <label
          htmlFor="email"
          className="mb-[8px] block text-[12px] font-bold tracking-[0.7px] text-[#94887B]"
        >
          EMAIL
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-[#3F362E] focus:outline-none"
        />
        <label
          htmlFor="password"
          className="mb-[8px] block text-[12px] font-bold tracking-[0.7px] text-[#94887B]"
        >
          CONTRASEÑA
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          className="mb-[10px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
        />

        <div className="mb-5 text-right">
          <span className="cursor-pointer text-[13.5px] font-bold text-[#C5503A]">
            ¿Olvidaste tu contraseña?
          </span>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-3 py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Ingresando…" : "Iniciar sesión"}
        </button>

        {state?.error ? (
          <p role="alert" className="mt-[14px] text-[13.5px] font-bold text-[#C5503A]">
            {state.error}
          </p>
        ) : null}
      </form>

      <p className="mt-6 text-center text-[14.5px] text-[#94887B]">
        ¿Te invitó la guardería?{" "}
        <span className="cursor-pointer font-extrabold text-[#C5503A]">
          Activá tu cuenta
        </span>
      </p>
    </div>
  );
}
