import { SunIcon } from "@/components/icons";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-[1.05fr_1fr] bg-[#FBF4EC]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,#F6A98E_0%,#F2937A_45%,#EC7E62_100%)] px-[60px] py-14 text-white">
        <div className="absolute -right-[120px] -top-[140px] h-[420px] w-[420px] rounded-full bg-[rgba(255,255,255,0.12)]" />
        <div className="absolute -bottom-[110px] -left-[80px] h-[300px] w-[300px] rounded-full bg-[rgba(255,255,255,0.1)]" />

        <div className="relative flex items-center gap-[13px]">
          <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-[rgba(255,255,255,0.22)]">
            <SunIcon className="h-[26px] w-[26px] text-white" />
          </div>
          <span className="font-display text-[21px] font-semibold tracking-[0.5px]">
            OpenDayCare
          </span>
        </div>

        <div className="relative">
          <h1 className="mb-[18px] font-display text-[42px] font-semibold leading-[1.12] text-white">
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p className="m-0 max-w-[430px] text-[17px] leading-[1.6] text-[rgba(255,255,255,0.92)]">
            Publicá momentos, gestioná las salas y mantené a las familias cerca,
            desde un solo lugar.
          </p>
        </div>

        <div className="relative text-[14px] text-[rgba(255,255,255,0.9)]">
          🌿 Guardería Sala Soles
        </div>
      </div>

      <div className="flex items-center justify-center p-10">
        <div className="w-full max-w-[392px]">
          <h2 className="mb-[6px] font-display text-[30px] font-semibold text-[#3F362E]">
            Iniciar sesión
          </h2>
          <p className="mb-[28px] text-[15px] text-[#94887B]">
            Ingresá para ver el día de hoy.
          </p>

          <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
            EMAIL
          </div>
          <input
            type="email"
            className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-[#3F362E] focus:outline-none"
          />
          <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
            CONTRASEÑA
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="mb-[10px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
          />

          <div className="mb-5 text-right">
            <span className="cursor-pointer text-[13.5px] font-bold text-[#C5503A]">
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          <button
            type="button"
            className="w-full cursor-pointer rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-3 py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
          >
            Iniciar sesión
          </button>

          <p className="mt-6 text-center text-[14.5px] text-[#94887B]">
            ¿Te invitó la guardería?{" "}
            <span className="cursor-pointer font-extrabold text-[#C5503A]">
              Activá tu cuenta
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
