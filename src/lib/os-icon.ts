const SYSTEM_ICON_MAPPINGS = [
  ["almalinux", "almalinux"],
  ["alpine", "alpine"],
  ["archcraft", "archcraft"],
  ["archlabs", "archlabs"],
  ["arcolinux", "arcolinux"],
  ["arch", "arch"],
  ["artix", "artix"],
  ["centos", "centos"],
  ["coreos", "coreos"],
  ["debian", "debian"],
  ["deepin", "deepin"],
  ["devuan", "devuan"],
  ["elementary", "elementary"],
  ["endeavour", "endeavour"],
  ["fedora", "fedora"],
  ["freebsd", "freebsd"],
  ["garuda", "garuda"],
  ["gentoo", "gentoo"],
  ["kali", "kali"],
  ["kubuntu", "kubuntu"],
  ["linux mint", "linuxmint"],
  ["mageia", "mageia"],
  ["mandriva", "mandriva"],
  ["manjaro", "manjaro"],
  ["mx linux", "mxlinux"],
  ["nixos", "nixos"],
  ["nobara", "nobara"],
  ["openbsd", "openbsd"],
  ["opensuse", "opensuse"],
  ["pop!_os", "popos"],
  ["pop os", "popos"],
  ["raspbian", "raspberrypi"],
  ["raspberry", "raspberrypi"],
  ["red hat", "redhat"],
  ["redhat", "redhat"],
  ["rocky", "rockylinux"],
  ["slackware", "slackware"],
  ["solus", "solus"],
  ["windows", "windows"],
  ["ubuntu", "ubuntu"],
  ["void", "void"],
  ["zorin", "zorin"],
  ["darwin", "apple"],
  ["macos", "apple"],
  ["mac os", "apple"],
] as const;

/** Resolves an OS string to the bundled colored SVG icon under /assets/os-icons. */
export function systemIconSrc(system: string) {
  const normalized = system.toLowerCase();
  const key =
    SYSTEM_ICON_MAPPINGS.find(([name]) => normalized.includes(name))?.[1] ??
    "tux";
  return `/assets/os-icons/${key}.svg`;
}
