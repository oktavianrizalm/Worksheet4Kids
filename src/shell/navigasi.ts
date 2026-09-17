/**
 * Guard Tombol Back Peramban & Gestur Edge-Swipe OS.
 * Mencegah gestur kembali menutup PWA:
 * - Jika sedang di layar latihan -> kembali ke beranda.
 * - Jika sudah di beranda -> pushState ulang agar PWA tetap terbuka.
 */
export function pasangGuardTombolBack(
  onCobaKembaliKeBeranda: () => boolean
): () => void {
  // Inisialisasi state beranda pertama kali
  history.pushState({ layar: 'beranda' }, '');

  const onPopState = () => {
    // onCobaKembaliKeBeranda() mengembalikan true jika sedang di latihan (berhasil kembali)
    // dan mengembalikan false jika memang sudah berada di beranda
    const kembaliDariLatihan = onCobaKembaliKeBeranda();
    if (!kembaliDariLatihan) {
      // Jika sudah di beranda, kunci kembali dengan pushState agar tidak keluar PWA
      history.pushState({ layar: 'beranda' }, '');
    }
  };

  window.addEventListener('popstate', onPopState);

  return () => {
    window.removeEventListener('popstate', onPopState);
  };
}
