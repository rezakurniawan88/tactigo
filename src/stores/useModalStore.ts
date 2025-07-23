import { create } from 'zustand'

type TUseModalStore = {
    modalCreateTacticIsOpen: boolean;
    setModalCreateTacticIsOpen: (value: boolean) => void;
}

const useModalStore = create<TUseModalStore>((set) => ({
  modalCreateTacticIsOpen: false,
  setModalCreateTacticIsOpen: (value) => set({ modalCreateTacticIsOpen: value }),
}))

export default useModalStore;