export enum PersonName {
    NAJMA = 'Najma',
    EMILIA = 'Emilia',
    ZULEIMA = 'Zuleima',
    VICTOR = 'Victor',
    CHRIS = 'Chris',
    LYNNE = 'Lynne',
    AL = 'Al',
    ALANA = 'Alana',
    DYLAN = 'Dylan',
}

const OrderedStoresPerPerson = [
    {
        person: PersonName.NAJMA,
        stores: ['1831', '20513', '20514', '23718', '28181'],
    },
    {
        person: PersonName.EMILIA,
        stores: ['5176', '11491', '13675', '34360'],
    },
    {
        person: PersonName.ZULEIMA,
        stores: ['4706', '10000', '10270', '14112', '19891'],
    },
    {
        person: PersonName.VICTOR,
        stores: ['1631', '1982', '6432', '10428', '10738', '17539', '32581'],
    },
    {
        person: PersonName.CHRIS,
        stores: ['1630', '3264', '5123', '7430', '8072', '27256'],
    },
    {
        person: PersonName.LYNNE,
        stores: ['5802', '7959', '10275', '16118'],
    },
    {
        person: PersonName.AL,
        stores: ['4693', '5226', '8027', '26438', '27565'],
    },
    {
        person: PersonName.ALANA,
        stores: ['18346', '25325', '25988', '27655', '32987'],
    },
    {
        person: PersonName.DYLAN,
        stores: ['4103', '10346', '16117', '31485'],
    },
];

export const OrderedStores = [...OrderedStoresPerPerson.flatMap(({ person, stores }) => [...stores, person])];
