export enum PersonName {
    EMILIA = 'Emilia',
    JEAN = 'Jean',
    AL = 'Al',
    ALANA = 'Alana',
    DYLAN = 'Dylan',
}

const OrderedStoresPerPerson = [
    {
        person: PersonName.EMILIA,
        stores: ['1831', '23718', '34360', '11491', '5176'],
    },
    {
        person: PersonName.JEAN,
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
