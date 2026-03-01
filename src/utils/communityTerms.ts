export function getTerms(communityType: string) {
    const terms: Record<string, Record<string, string>> = {
        hoa: {
            members: 'Residents',
            fees: 'Dues',
            rules: 'Bylaws',
            board: 'Board',
        },
        sports_club: {
            members: 'Members',
            fees: 'Membership fees',
            rules: 'Club rules',
            board: 'Committee',
        },
        religious: {
            members: 'Congregation',
            fees: 'Tithes / Contributions',
            rules: 'Guidelines',
            board: 'Leadership',
        },
        tenant_union: {
            members: 'Tenants',
            fees: 'Union dues',
            rules: 'Bylaws',
            board: 'Organizers',
        },
        default: {
            members: 'Members',
            fees: 'Membership fees',
            rules: 'Community rules',
            board: 'Admin',
        },
    }
    return terms[communityType] ?? terms.default
}
