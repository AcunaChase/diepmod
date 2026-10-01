// Hexlock pixel scanner, compiled to WebAssembly.
// Classifies canvas pixels by color and returns the match nearest the canvas center.
// Mirrors detectItems() + findNearestItem() in extension/content.js.
#![no_std]

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_: &PanicInfo) -> ! {
    loop {}
}

pub const SQUARE: u32 = 1;
pub const TRIANGLE: u32 = 2;
pub const HEXAGON: u32 = 3;

static mut HIT_X: u32 = 0;
static mut HIT_Y: u32 = 0;

// 0 = not a target, otherwise SQUARE / TRIANGLE / HEXAGON
#[inline(always)]
fn classify(r: u8, g: u8, b: u8) -> u32 {
    // Player color rgb(241, 78, 84) with tolerance: never a target
    if r >= 230 && g >= 65 && g <= 95 && b >= 70 && b <= 100 {
        return 0;
    }
    let dark_red = r > 150 && g < 80 && b < 80;
    if dark_red {
        return 0;
    }
    if r > 180 && g > 180 && b < 120 {
        return SQUARE;
    }
    if r > 150 && g > 50 && g < 130 && b > 30 && b < 130 {
        return TRIANGLE;
    }
    if r < 130 && g < 130 && b > 180 {
        return HEXAGON;
    }
    0
}

#[inline(always)]
unsafe fn in_zone(zones: *const u32, zone_count: u32, x: u32, y: u32) -> bool {
    let mut i = 0usize;
    while i < zone_count as usize {
        let z = zones.add(i * 4);
        if x >= *z && y >= *z.add(1) && x < *z.add(2) && y < *z.add(3) {
            return true;
        }
        i += 1;
    }
    false
}

/// Scans RGBA `pixels` (width * height * 4 bytes), sampling every `step` pixels.
/// `mask` picks which shapes count: bit 0 squares, bit 1 triangles, bit 2 hexagons.
/// `zones` holds `zone_count` boxes of [x0, y0, x1, y1]; pixels inside one are never targets
/// (the game's HUD is drawn on the same canvas and reuses shape colors).
/// Returns the type of the nearest match (0 if none); read its position with hit_x / hit_y.
#[no_mangle]
pub unsafe extern "C" fn scan(
    pixels: *const u8,
    width: u32,
    height: u32,
    step: u32,
    mask: u32,
    zones: *const u32,
    zone_count: u32,
) -> u32 {
    let step = if step == 0 { 1 } else { step };
    let cx = width as f64 / 2.0;
    let cy = height as f64 / 2.0;

    let mut best_type = 0u32;
    let mut best_dist = f64::INFINITY;

    let mut y = 0u32;
    while y < height {
        let row = pixels.add((y as usize) * (width as usize) * 4);
        let dy = y as f64 - cy;
        let mut x = 0u32;
        while x < width {
            let p = row.add((x as usize) * 4);
            let kind = classify(*p, *p.add(1), *p.add(2));
            if kind != 0 && mask & (1 << (kind - 1)) != 0 && !in_zone(zones, zone_count, x, y) {
                let dx = x as f64 - cx;
                let dist = dx * dx + dy * dy;
                // dist > 100 skips your own tank; ties go to the lower type, then scan order
                if dist > 100.0 && (dist < best_dist || (dist == best_dist && kind < best_type)) {
                    best_dist = dist;
                    best_type = kind;
                    HIT_X = x;
                    HIT_Y = y;
                }
            }
            x += step;
        }
        y += step;
    }
    best_type
}

#[no_mangle]
pub unsafe extern "C" fn hit_x() -> u32 {
    HIT_X
}

#[no_mangle]
pub unsafe extern "C" fn hit_y() -> u32 {
    HIT_Y
}
