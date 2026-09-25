export interface UserClaimEvent {
  id: string;
  userHandle: string;
  avatarInitials: string;
  actionKm: string;
  actionEn: string;
  rewardText: string;
  timeAgoKm: string;
  timeAgoEn: string;
  badgeType: "spin" | "game" | "upgrade" | "partner" | "voucher";
}

export const RECENT_USER_CLAIMS: UserClaimEvent[] = [
  {
    id: "c-1",
    userHandle: "@sokha_kh",
    avatarInitials: "SK",
    actionKm: "បានបង្វិលកងសំណាងប្រចាំថ្ងៃ",
    actionEn: "spun the Daily Wheel",
    rewardText: "+500 PTS",
    timeAgoKm: "ទើបតែមុននេះ",
    timeAgoEn: "Just now",
    badgeType: "spin",
  },
  {
    id: "c-2",
    userHandle: "@chann_ton",
    avatarInitials: "CT",
    actionKm: "បានឈ្នះក្នុងហ្គេម Ton Roulette",
    actionEn: "won Ton Roulette game",
    rewardText: "+1,200 PTS",
    timeAgoKm: "២ នាទីមុន",
    timeAgoEn: "2m ago",
    badgeType: "game",
  },
  {
    id: "c-3",
    userHandle: "@vibol_pp",
    avatarInitials: "VB",
    actionKm: "បានដំឡើង Vault ដល់ Level 4",
    actionEn: "upgraded Vault to Level 4",
    rewardText: "+5 PTS/tap",
    timeAgoKm: "៥ នាទីមុន",
    timeAgoEn: "5m ago",
    badgeType: "upgrade",
  },
  {
    id: "c-4",
    userHandle: "@dara_cambodia",
    avatarInitials: "DC",
    actionKm: "បាន Check-in ស្ថាប័នដៃគូផ្លូវការ",
    actionEn: "checked in Official Partner",
    rewardText: "+300 PTS",
    timeAgoKm: "៨ នាទីមុន",
    timeAgoEn: "8m ago",
    badgeType: "partner",
  },
  {
    id: "c-5",
    userHandle: "@piseth_dev",
    avatarInitials: "PD",
    actionKm: "បានបំពេញបេសកកម្ម Telegram",
    actionEn: "completed Telegram mission",
    rewardText: "+1,000 PTS",
    timeAgoKm: "១៤ នាទីមុន",
    timeAgoEn: "14m ago",
    badgeType: "voucher",
  },
  {
    id: "c-6",
    userHandle: "@srey_mao",
    avatarInitials: "SM",
    actionKm: "បានឈ្នះ Dice Duel ចំនួន ៣ ដង",
    actionEn: "won 3x streak in Dice Duel",
    rewardText: "+800 PTS",
    timeAgoKm: "២២ នាទីមុន",
    timeAgoEn: "22m ago",
    badgeType: "game",
  },
  {
    id: "c-7",
    userHandle: "@visal_vault",
    avatarInitials: "VV",
    actionKm: "បានដកសន្លឹកប័ណ្ណទូទាត់ប្រាក់",
    actionEn: "redeemed $10.00 USD voucher",
    rewardText: "$10.00 USD",
    timeAgoKm: "៣៥ នាទីមុន",
    timeAgoEn: "35m ago",
    badgeType: "voucher",
  },
  {
    id: "c-8",
    userHandle: "@makara_crypto",
    avatarInitials: "MC",
    actionKm: "បានឡើងដល់ចំណាត់ថ្នាក់ Top 10",
    actionEn: "reached Global Top 10 Rank",
    rewardText: "Rank #8",
    timeAgoKm: "៤៨ នាទីមុន",
    timeAgoEn: "48m ago",
    badgeType: "upgrade",
  },
  {
    id: "c-9",
    userHandle: "@thida_ton",
    avatarInitials: "TT",
    actionKm: "បានបើកប្រអប់រង្វាន់ពិសេស",
    actionEn: "opened Mystery Reward Chest",
    rewardText: "+2,500 PTS",
    timeAgoKm: "១ ម៉ោងមុន",
    timeAgoEn: "1h ago",
    badgeType: "spin",
  },
];
