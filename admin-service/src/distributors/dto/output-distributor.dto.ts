export class OutputDistributorDto {
  name: string;
  phone: string;
  email: string;
  cnpj: string;
  type: 'store' | 'pdv';
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };

  static fromEntities(distributors: any) {
    return distributors.map((distributor: any) => {
      const { address, ...distributorData } = distributor;
      console.log(distributorData);
      return {
        id: distributorData.id,
        name: distributorData.name,
        phone: distributorData.phone,
        email: distributorData.email,
        cnpj: distributorData.cnpj,
        is_active: distributorData.is_active,
        type: distributorData.type,
        address: {
          ...address,
        },
      };
    });
  }

  static fromEntity(distributor: any) {
    const { address, ...distributorData } = distributor;
    return {
      id: distributorData.id,
      name: distributorData.name,
      phone: distributorData.phone,
      email: distributorData.email,
      cnpj: distributorData.cnpj,
      is_active: distributorData.is_active,
      type: distributorData.type,
      address: {
        ...address,
      },
    };
  }
}
