import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

export const confirmDialog = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in zoom-in-95' : 'animate-out zoom-out-95'} max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto border border-gray-100 flex flex-col overflow-hidden`}>
        <div className="p-6">
            <div className="flex items-center gap-3 mb-3 text-brand-red">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-black">Konfirmasi</h3>
            </div>
            <p className="text-gray-600 font-medium leading-relaxed">{message}</p>
        </div>
        <div className="flex border-t border-gray-100">
          <button 
            className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
          >
            Batal
          </button>
          <div className="w-[1px] bg-gray-100"></div>
          <button 
            className="flex-1 px-4 py-4 text-sm font-bold text-brand-red hover:bg-red-50 transition-colors"
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
          >
            Yakin
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center'
    });
  });
};
