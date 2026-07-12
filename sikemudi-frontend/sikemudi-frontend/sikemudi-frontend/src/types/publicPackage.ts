export interface PublicCoursePackageApiItem {
  id: number;
  kode_paket: string;
  nama_paket: string;
  durasi_jam: number;
  deskripsi: string | null;
  harga_antar_jemput: number;
  harga_tidak_antar_jemput: number;
  harga_dengan_sim_antar_jemput: number;
  harga_dengan_sim_tidak_antar_jemput: number;
  termasuk_sertifikat: boolean;
  fasilitas: string[];
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PublicCoursePackageListData {
  items: PublicCoursePackageApiItem[];
}

export interface PublicCoursePackageDetailData {
  item: PublicCoursePackageApiItem;
}

export interface PublicCoursePackagePriceOption {
  key: string;
  label: string;
  description: string;
  price: number;
  highlight?: boolean;
}
