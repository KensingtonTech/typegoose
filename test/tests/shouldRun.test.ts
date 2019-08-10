import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { addModelToTypegoose, buildSchema, getModelForClass, modelOptions, prop } from '../../src/typegoose';
import { DisAbove, DisAboveModel, DisMain, DisMainModel } from '../models/discriminators';

/**
 * Function to pass into describe
 * ->Important: you need to always bind this
 * @example
 * ```
 * import { suite as ShouldRunTests } from './shouldRun.test'
 * ...
 * describe('Should just Run', ShouldRunTests.bind(this));
 * ...
 * ```
 */
export function suite() {
  it('should not error when trying to get model multiple times', () => {
    class TEST { }
    getModelForClass(TEST);
    getModelForClass(TEST);
  });

  it('should return cache for buildSchema', () => {
    class TEST { }
    buildSchema(TEST);
    buildSchema(TEST);
  });

  it('should use existingMongoose', async () => {
    @modelOptions({ existingMongoose: mongoose })
    class TESTexistingMongoose { }
    expect(getModelForClass(TESTexistingMongoose)).to.not.be.an('undefined');
  });

  it('should use existingConnection', async () => {
    @modelOptions({ existingConnection: mongoose.connection })
    class TESTexistingConnection { }
    expect(getModelForClass(TESTexistingConnection)).to.not.be.an('undefined');
  });

  it('should make use of discriminators', async () => {
    const dmmdoc = await DisMainModel.create({ main1: 'hello DMM' } as DisMain);
    const damdoc = await DisAboveModel.create({ main1: 'hello DAM', above1: 'hello DAM' } as DisAbove);
    expect(dmmdoc).to.not.be.an('undefined');
    expect(dmmdoc.main1).to.equals('hello DMM');
    expect(dmmdoc).to.not.have.property('above1');
    // any is required otherwise typescript complains about "__t" not existing
    expect((dmmdoc as any).__t).to.be.an('undefined');

    expect(damdoc).to.not.be.an('undefined');
    expect(damdoc.main1).to.equals('hello DAM');
    expect(damdoc.above1).to.equals('hello DAM');
    // any is required otherwise typescript complains about "__t" not existing
    expect((damdoc as any).__t).to.equals('DisAbove');
  });

  it('should make use of addModelToTypegoose', async () => {
    // addModelToTypegoose
    class TestAMTT {
      @prop({ required: true })
      public somevalue!: string;

      public somesecondvalue!: string;
    }
    const schema = buildSchema(TestAMTT);
    schema.add({ somesecondvalue: { type: String, required: true } });
    const model = addModelToTypegoose(mongoose.model(TestAMTT.name, schema), TestAMTT);
    const doc = await model.create({ somevalue: 'hello from SV', somesecondvalue: 'hello from SSV' } as TestAMTT);
    expect(doc).to.not.be.an('undefined');
    expect(doc.somevalue).to.equal('hello from SV');
    expect(doc.somesecondvalue).to.equal('hello from SSV');
  });
}
