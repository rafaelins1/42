import { execSync } from 'child_process';
import fs from 'fs';

const productsDir = 'public/assets/products';
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

const cropList = [
  // 1. image_75e78a40.png (535x753)
  { src: 'image_75e78a40.png', out: 'kit_hall_of_weed.png', x: 13, y: 65, w: 93, h: 105 },
  { src: 'image_75e78a40.png', out: 'filtro_papelito_biodegradavel.png', x: 13, y: 226, w: 93, h: 106 },
  { src: 'image_75e78a40.png', out: 'filtro_papelito_longo_biodegradavel.png', x: 271, y: 226, w: 93, h: 106 },
  { src: 'image_75e78a40.png', out: 'filtro_papelito_slim.png', x: 13, y: 345, w: 93, h: 106 },
  { src: 'image_75e78a40.png', out: 'filtro_papelito_ultra_longo.png', x: 271, y: 345, w: 93, h: 106 },
  { src: 'image_75e78a40.png', out: 'filtro_bembolado_slim_biodegradavel.png', x: 13, y: 464, w: 93, h: 106 },
  { src: 'image_75e78a40.png', out: 'filtro_papelito_longo_tradicional.png', x: 271, y: 464, w: 93, h: 106 },
  { src: 'image_75e78a40.png', out: 'seda_papelito_mini_brown.png', x: 13, y: 624, w: 93, h: 106 },
  { src: 'image_75e78a40.png', out: 'seda_piteira_papelito_bandeja.png', x: 271, y: 624, w: 93, h: 106 },

  // 2. image_72d7dcea.png (545x725)
  { src: 'image_72d7dcea.png', out: 'seda_bem_bolado_slim.png', x: 13, y: 157, w: 92, h: 104 },
  { src: 'image_72d7dcea.png', out: 'seda_celulose_aleda_kingsize.png', x: 272, y: 157, w: 92, h: 104 },
  { src: 'image_72d7dcea.png', out: 'seda_celulose_lion_circus_g.png', x: 13, y: 276, w: 92, h: 104 },
  { src: 'image_72d7dcea.png', out: 'seda_celulose_lion_circus_p.png', x: 272, y: 276, w: 92, h: 104 },
  { src: 'image_72d7dcea.png', out: 'piteira_vidro_penguim_xl.png', x: 13, y: 454, w: 92, h: 104 },
  { src: 'image_72d7dcea.png', out: 'dichavador_cubo_lion_circus.png', x: 13, y: 624, w: 92, h: 98 },
  { src: 'image_72d7dcea.png', out: 'dichavador_cubo_mystic_timbers.png', x: 272, y: 624, w: 92, h: 98 },

  // 3. image_02dfad32.png (551x605)
  { src: 'image_02dfad32.png', out: 'dichavador_lion_rolling_circus.png', x: 13, y: 750, w: 92, h: 98, optional: true },
  { src: 'image_02dfad32.png', out: 'piteira_bamf_large.png', x: 13, y: 48, w: 92, h: 104 },
  { src: 'image_02dfad32.png', out: 'piteira_bem_bolado_cone.png', x: 275, y: 48, w: 92, h: 104 },
  { src: 'image_02dfad32.png', out: 'piteira_bembolado_large.png', x: 13, y: 167, w: 92, h: 104 },
  { src: 'image_02dfad32.png', out: 'piteira_hippsterclub_xxl.png', x: 275, y: 167, w: 92, h: 104 },
  { src: 'image_02dfad32.png', out: 'piteira_nilo_xxl.png', x: 13, y: 286, w: 92, h: 104 },
  { src: 'image_02dfad32.png', out: 'piteira_papelito_fun_large.png', x: 275, y: 286, w: 92, h: 104 },

  // 4. image_8ef74985.png (554x603)
  { src: 'image_8ef74985.png', out: 'slick_divisor_squadafum_25ml.png', x: 13, y: 48, w: 92, h: 104 },
  { src: 'image_8ef74985.png', out: 'slick_cultdab_5ml.png', x: 275, y: 48, w: 92, h: 104 },
  { src: 'image_8ef74985.png', out: 'slick_lego_26ml.png', x: 13, y: 167, w: 92, h: 104 },
  { src: 'image_8ef74985.png', out: 'slick_mini_cactus_5ml.png', x: 275, y: 167, w: 92, h: 104 },
  { src: 'image_8ef74985.png', out: 'slick_sadhu_9ml_3div.png', x: 13, y: 286, w: 92, h: 104 },
  { src: 'image_8ef74985.png', out: 'slick_sadhu_com_espatula.png', x: 275, y: 286, w: 92, h: 104 },
  { src: 'image_8ef74985.png', out: 'cuia_banheira_silly_tray_laranja.png', x: 13, y: 445, w: 92, h: 104 },
  { src: 'image_8ef74985.png', out: 'cuia_banheira_silly_tray_verde.png', x: 275, y: 445, w: 92, h: 104 },
  { src: 'image_8ef74985.png', out: 'cuia_banheira_silly_tray_azul.png', x: 13, y: 565, w: 92, h: 36 },
  { src: 'image_8ef74985.png', out: 'cuia_chaveiro_holder_m.png', x: 275, y: 565, w: 92, h: 36 },

  // 5. image_8040f8b9.png (552x595)
  { src: 'image_8040f8b9.png', out: 'cuia_silicone_abduzido_g.png', x: 13, y: 720, w: 92, h: 80, optional: true },
  { src: 'image_8040f8b9.png', out: 'isqueiro_cliper_recarregavel.png', x: 13, y: 38, w: 92, h: 104 },
  { src: 'image_8040f8b9.png', out: 'isqueiro_zippo_recarregavel.png', x: 275, y: 38, w: 92, h: 104 },
  { src: 'image_8040f8b9.png', out: 'isqueiro_bic_g.png', x: 13, y: 157, w: 92, h: 104 },
  { src: 'image_8040f8b9.png', out: 'tesoura_metal_garca.png', x: 13, y: 445, w: 92, h: 104 },
  { src: 'image_8040f8b9.png', out: 'tesoura_dobravel_to_na_be.png', x: 275, y: 445, w: 92, h: 104 },
  { src: 'image_8040f8b9.png', out: 'tesoura_dobravel_metal.png', x: 13, y: 565, w: 92, h: 28 },

  // 6. image_ec81ea1e.png (561x722)
  { src: 'image_ec81ea1e.png', out: 'mini_lata_lion_rolling_circus.png', x: 13, y: 175, w: 92, h: 104 },
  { src: 'image_ec81ea1e.png', out: 'porta_beck_metal_bem_bolado.png', x: 275, y: 175, w: 92, h: 104 },
  { src: 'image_ec81ea1e.png', out: 'porta_beck_plastico_p.png', x: 13, y: 295, w: 92, h: 104 },
  { src: 'image_ec81ea1e.png', out: 'nectar_collector.png', x: 275, y: 295, w: 92, h: 104 },
  { src: 'image_ec81ea1e.png', out: 'porta_isqueiro_anti_rato.png', x: 13, y: 415, w: 92, h: 104 },
  { src: 'image_ec81ea1e.png', out: 'case_meninas_super_poderosas.png', x: 13, y: 520, w: 92, h: 104 },
  { src: 'image_ec81ea1e.png', out: 'case_to_na_be_verde.png', x: 275, y: 520, w: 92, h: 104 },
  { src: 'image_ec81ea1e.png', out: 'case_to_na_be_rosa.png', x: 13, y: 640, w: 92, h: 80 },
  { src: 'image_ec81ea1e.png', out: 'case_lata_cigarro.png', x: 275, y: 640, w: 92, h: 80 },

  // 7. image_3d5ac436.png (577x602)
  { src: 'image_3d5ac436.png', out: 'mini_bandeja_hello_kitty.png', x: 15, y: 165, w: 92, h: 104 },
  { src: 'image_3d5ac436.png', out: 'bandeja_honeypuff_vidro.png', x: 280, y: 165, w: 92, h: 104 },
  { src: 'image_3d5ac436.png', out: 'bandeja_lion_circus_vidro.png', x: 15, y: 285, w: 92, h: 104 },
  { src: 'image_3d5ac436.png', out: 'bong_acrilico.png', x: 15, y: 445, w: 92, h: 104 },
  { src: 'image_3d5ac436.png', out: 'bong_silicone_pickle_rick.png', x: 280, y: 445, w: 92, h: 104 },
  { src: 'image_3d5ac436.png', out: 'bong_acrilico_squadafum.png', x: 15, y: 565, w: 92, h: 36 },
  { src: 'image_3d5ac436.png', out: 'bong_de_vidro.png', x: 280, y: 565, w: 92, h: 36 },

  // 8. image_db93c6e6.png (531x605)
  { src: 'image_db93c6e6.png', out: 'tabaco_amsterdam_25g.png', x: 13, y: 48, w: 92, h: 104 },
  { src: 'image_db93c6e6.png', out: 'tabaco_tanamao_25g.png', x: 270, y: 48, w: 92, h: 104 },
  { src: 'image_db93c6e6.png', out: 'kumbaya_com_tabaco_sasso.png', x: 13, y: 167, w: 92, h: 104 },
  { src: 'image_db93c6e6.png', out: 'kumbaya_sasso.png', x: 270, y: 167, w: 92, h: 104 },
  { src: 'image_db93c6e6.png', out: 'tabaco_da_chapada_25g.png', x: 13, y: 286, w: 92, h: 104 },
  { src: 'image_db93c6e6.png', out: 'tabaco_sasso_gold_25g.png', x: 270, y: 286, w: 92, h: 104 },
  { src: 'image_db93c6e6.png', out: 'bolador_himalaya_spliff_g.png', x: 13, y: 445, w: 92, h: 104 },
  { src: 'image_db93c6e6.png', out: 'bolador_lion_circus_p.png', x: 270, y: 445, w: 92, h: 104 },
  { src: 'image_db93c6e6.png', out: 'bolador_sadhu_g.png', x: 13, y: 565, w: 92, h: 38 },
  { src: 'image_db93c6e6.png', out: 'bolador_hi_tobacco_mini.png', x: 270, y: 565, w: 92, h: 38 },

  // 9. image_43dae67a.png (557x642)
  { src: 'image_43dae67a.png', out: 'cinzeiro_carro.png', x: 13, y: 48, w: 92, h: 104 },
  { src: 'image_43dae67a.png', out: 'cinzeiro_vidro_rick_morty.png', x: 275, y: 48, w: 92, h: 104 },
  { src: 'image_43dae67a.png', out: 'cinzeiro_vidro_to_na_be.png', x: 13, y: 167, w: 92, h: 104 },
  { src: 'image_43dae67a.png', out: 'cinzeiro_metal_giratorio_g.png', x: 275, y: 167, w: 92, h: 104 },
  { src: 'image_43dae67a.png', out: 'cinzeiro_metal_giratorio_p.png', x: 13, y: 286, w: 92, h: 104 },
  { src: 'image_43dae67a.png', out: 'cinzeiro_prato.png', x: 275, y: 286, w: 92, h: 104 },
  { src: 'image_43dae67a.png', out: 'shoulder_bag_puff.png', x: 13, y: 445, w: 92, h: 104 }
];

let count = 0;
for (const item of cropList) {
  try {
    const srcPath = `public/assets/aistudio/${item.src}`;
    const outPath = `public/assets/products/${item.out}`;
    if (!fs.existsSync(srcPath)) continue;

    const cmd = `convert "${srcPath}" -crop ${item.w}x${item.h}+${item.x}+${item.y} +repage "${outPath}"`;
    execSync(cmd);
    count++;
  } catch (err) {
    if (!item.optional) {
      console.warn(`Failed to crop ${item.out}:`, err.message);
    }
  }
}

console.log(`Successfully cropped ${count} product images into ${productsDir}`);
