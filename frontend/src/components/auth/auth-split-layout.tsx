import * as React from 'react';
import { cn } from '@/lib/utils';

export function AuthSplitLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-h-screen bg-white text-black grid grid-cols-1 lg:grid-cols-2',
        className,
      )}
    >
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <div className="hidden lg:flex items-center justify-center p-12 bg-white">
        {/* Aquí puedes ajustar el tamaño de la imagen modificando las clases del contenedor o de la imagen directamente. 
            El max-w-xl define el ancho máximo (equivale a 36rem o 576px). Puedes usar max-w-2xl, max-w-full, etc. */}
        <div className="w-full flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Nuevo Hospital Panamericano"
            className="w-full max-w-lg lg:max-w-xl h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
